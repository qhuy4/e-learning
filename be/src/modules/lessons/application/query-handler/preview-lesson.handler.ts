import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PreviewLessonQuery } from '../query/preview-lesson.query';
import {
  LESSON_REPOSITORY,
  ILessonRepository,
} from '../../domain/repository/lesson.repository';
import {
  SECTION_REPOSITORY,
  ISectionRepository,
} from '@/modules/sections/domain/repository/section.repository';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '@/modules/courses/domain/repository/course.repository';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import {
  FileStorage,
  FILE_STORAGE,
} from '@/common/storage/domain/interface/file-storage.interface';
import { LessonDtoMapper } from '../../presentation/mappers/lesson-dto.mapper';
import { PreviewTokenService } from '@/common/service/preview-token.service';

async function resolveSignedUrl(
  key: string | null,
  storage: FileStorage,
): Promise<string | null> {
  if (!key) return null;
  if (key.startsWith('http')) return key;
  try {
    return await storage.createDownloadUrl({ key, expiresIn: 3600 });
  } catch {
    return null;
  }
}

@QueryHandler(PreviewLessonQuery)
export class PreviewLessonHandler implements IQueryHandler<PreviewLessonQuery> {
  constructor(
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
    private readonly previewTokenService: PreviewTokenService,
  ) {}

  async execute(query: PreviewLessonQuery) {
    const { token, lessonId, lessonSlug } = query;
    const payload = this.previewTokenService.verifyCoursePreviewToken(token);

    let lesson: any = null;
    if (lessonId) {
      lesson = await this.lessonRepository.findById(lessonId);
    } else if (lessonSlug) {
      lesson = await this.lessonRepository.findGlobalBySlug(lessonSlug);
    }

    if (!lesson) {
      throw new NotFoundException('Lesson không tồn tại');
    }

    const section = await this.sectionRepository.findById(lesson.sectionId);
    if (!section || Number(section.courseId) !== Number(payload.courseId)) {
      throw new ForbiddenException('Lesson không thuộc khóa học đang preview');
    }

    if (payload.role === UserRole.ADMIN) {
      const signedUrl = await resolveSignedUrl(
        lesson.videoSource,
        this.storage,
      );
      return LessonDtoMapper.toDetailDto(lesson, signedUrl);
    }

    if (payload.role === UserRole.INSTRUCTOR) {
      const course = await this.courseRepository.findById(
        Number(section.courseId),
      );
      if (!course || course.instructorId !== payload.userId) {
        throw new ForbiddenException('Bạn không có quyền preview lesson này');
      }
      const signedUrl = await resolveSignedUrl(
        lesson.videoSource,
        this.storage,
      );
      return LessonDtoMapper.toDetailDto(lesson, signedUrl);
    }

    throw new ForbiddenException('Bạn không có quyền preview lesson này');
  }
}
