import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';
import { LessonMaterialOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson-material.orm-entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';
import { SectionOrmEntity } from '@/modules/sections/infrastructure/entity/section.orm-entity';
import {
  ENROLLMENT_REPOSITORY,
  IEnrollmentRepository,
} from '@/modules/enrollments/domain/repository/enrollment.repository';
import { PreviewTokenService } from '@/common/service/preview-token.service';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '@/modules/courses/domain/repository/course.repository';
import { UserRole } from '@/modules/users/domain/enum/user.role';

/**
 * Học viên: xem + tải tài liệu của bài học.
 * Quy tắc truy cập giống xem video: bài xem thử (isPreview) HOẶC đã ghi danh khóa học.
 */
@Controller('lessons')
export class LessonMaterialController {
  constructor(
    @InjectRepository(LessonMaterialOrmEntity)
    private readonly materialRepo: Repository<LessonMaterialOrmEntity>,
    @InjectRepository(LessonOrmEntity)
    private readonly lessonRepo: Repository<LessonOrmEntity>,
    @InjectRepository(SectionOrmEntity)
    private readonly sectionRepo: Repository<SectionOrmEntity>,
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepo: IEnrollmentRepository,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
    private readonly jwtService: JwtService,
    private readonly previewTokenService: PreviewTokenService,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  private async toDto(material: LessonMaterialOrmEntity) {
    let downloadUrl: string | null = null;
    try {
      downloadUrl = await this.storage.createDownloadUrl({
        key: material.fileKey,
        expiresIn: 3600,
      });
    } catch {
      downloadUrl = null;
    }

    return {
      id: Number(material.id),
      lessonId: Number(material.lessonId),
      title: material.title,
      description: material.description,
      fileName: material.fileName,
      fileSize: material.fileSize ? Number(material.fileSize) : null,
      mimeType: material.mimeType,
      downloadUrl,
      createdAt: material.createdAt,
    };
  }

  @Get(':id/materials')
  async getMaterials(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Query('token') previewToken?: string,
  ) {
    const lesson = await this.lessonRepo.findOne({
      where: { id: String(id) },
    });
    if (!lesson) {
      throw new NotFoundException('Không tìm thấy bài học.');
    }

    // Token tùy chọn: không có/chưa đăng nhập vẫn xem được bài xem thử
    let userId: number | undefined;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const payload = this.jwtService.verify<{ sub?: number; id?: number }>(
          authHeader.substring(7),
        );
        userId = Number(payload.sub ?? payload.id);
      }
    } catch {
      userId = undefined;
    }

    const section = lesson.sectionId
      ? await this.sectionRepo.findOne({
          where: { id: lesson.sectionId.toString() },
        })
      : null;

    let canView = !!lesson.isPreview;

    // Giảng viên/admin xem trước: token phải đúng khóa học của bài học.
    if (!canView && previewToken) {
      const payload =
        this.previewTokenService.verifyCoursePreviewToken(previewToken);

      if (!section || Number(section.courseId) !== Number(payload.courseId)) {
        throw new ForbiddenException(
          'Preview token không thuộc khóa học của bài học này.',
        );
      }

      const role: UserRole = payload.role;

      if (role === UserRole.ADMIN) {
        canView = true;
      } else if (role === UserRole.INSTRUCTOR) {
        const course = await this.courseRepository.findById(payload.courseId);
        canView = !!course && course.instructorId === payload.userId;
      }
    }

    if (!canView && userId && section) {
      canView = await this.enrollmentRepo.existsActiveByUserAndCourse(
        userId,
        Number(section.courseId),
      );
    }

    if (!canView) {
      throw new ForbiddenException(
        'Bạn chưa có quyền xem tài liệu của bài học này.',
      );
    }

    const items = await this.materialRepo.find({
      where: { lessonId: String(id) },
      order: { position: 'ASC', id: 'ASC' },
    });

    return Promise.all(items.map((item) => this.toDto(item)));
  }
}
