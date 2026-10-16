import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { extname } from 'path';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';
import { LessonMaterialOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson-material.orm-entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';
import {
  CreateLessonMaterialDto,
  UpdateLessonMaterialDto,
} from '@/modules/lessons/presentation/dto/lesson-material.dto';

/** Chỉ chấp nhận tài liệu học tập: PDF, Word, PowerPoint, Excel, TXT, ZIP */
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
];

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.txt',
  '.csv',
  '.zip',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

@Controller('instructor/lessons')
@UseGuards(JwtAuthGuard)
export class InstructorLessonMaterialController {
  constructor(
    @InjectRepository(LessonMaterialOrmEntity)
    private readonly materialRepo: Repository<LessonMaterialOrmEntity>,
    @InjectRepository(LessonOrmEntity)
    private readonly lessonRepo: Repository<LessonOrmEntity>,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
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
      position: material.position,
      downloadUrl,
      createdAt: material.createdAt,
    };
  }

  /** Danh sách tài liệu của một bài học (giảng viên) */
  @Get(':lessonId/materials')
  async list(@Param('lessonId', ParseIntPipe) lessonId: number) {
    const lesson = await this.lessonRepo.findOne({
      where: { id: String(lessonId) },
    });
    if (!lesson) {
      throw new NotFoundException('Không tìm thấy bài học.');
    }

    const items = await this.materialRepo.find({
      where: { lessonId: String(lessonId) },
      order: { position: 'ASC', id: 'ASC' },
    });

    return Promise.all(items.map((item) => this.toDto(item)));
  }

  /** Tải tài liệu lên (kèm thông tin hiển thị) */
  @Post(':lessonId/materials')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: CreateLessonMaterialDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Vui lòng chọn file tài liệu.');
    }

    const extension = extname(file.originalname || '').toLowerCase();
    if (
      !ALLOWED_MIME_TYPES.includes(file.mimetype) &&
      !ALLOWED_EXTENSIONS.includes(extension)
    ) {
      throw new BadRequestException(
        'Định dạng tài liệu không hợp lệ (chấp nhận PDF, Word, PowerPoint, Excel, TXT, ZIP).',
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Tài liệu tối đa 25MB.');
    }

    const lesson = await this.lessonRepo.findOne({
      where: { id: String(lessonId) },
    });
    if (!lesson) {
      throw new NotFoundException('Không tìm thấy bài học.');
    }

    const key = `lessons/materials/${randomUUID()}${extension}`;
    await this.storage.upload({
      key,
      body: file.buffer,
      contentType: file.mimetype || 'application/octet-stream',
      contentLength: file.size,
    });

    try {
      const count = await this.materialRepo.count({
        where: { lessonId: String(lessonId) },
      });

      const material = this.materialRepo.create({
        lessonId: String(lessonId),
        title: (dto.title?.trim() || file.originalname || 'Tài liệu').slice(
          0,
          255,
        ),
        description: dto.description?.trim() || null,
        fileKey: key,
        fileName: (file.originalname || 'file').slice(0, 255),
        fileSize: String(file.size ?? 0),
        mimeType: file.mimetype || null,
        position: count,
      });

      const saved = await this.materialRepo.save(material);
      return await this.toDto(saved);
    } catch (err) {
      // Không lưu được DB → dọn file R2 đã tải lên
      await this.storage.delete(key).catch(() => undefined);
      throw err;
    }
  }

  /** Chỉnh sửa thông tin tài liệu (tên hiển thị, mô tả, thứ tự) */
  @Patch('materials/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonMaterialDto,
  ) {
    const material = await this.materialRepo.findOne({
      where: { id: String(id) },
    });
    if (!material) {
      throw new NotFoundException('Không tìm thấy tài liệu.');
    }

    if (dto.title !== undefined && dto.title.trim()) {
      material.title = dto.title.trim().slice(0, 255);
    }
    if (dto.description !== undefined) {
      material.description = dto.description?.trim() || null;
    }
    if (dto.position !== undefined) {
      material.position = dto.position;
    }

    const saved = await this.materialRepo.save(material);
    return await this.toDto(saved);
  }

  /** Xóa tài liệu (xóa cả file trên R2) */
  @Delete('materials/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const material = await this.materialRepo.findOne({
      where: { id: String(id) },
    });
    if (!material) {
      throw new NotFoundException('Không tìm thấy tài liệu.');
    }

    await this.materialRepo.remove(material);
    try {
      await this.storage.delete(material.fileKey);
    } catch {
      // File đã mất trên R2 → bỏ qua, DB đã sạch
    }

    return { success: true };
  }
}
