import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

import { CreateLessonDto } from '@/modules/lessons/presentation/dto/create-lesson.dto';
import { UpdateLessonDto } from '@/modules/lessons/presentation/dto/update-lesson.dto';

import { CreateLessonCommand } from '@/modules/lessons/application/command/create-lesson.command';
import { UpdateLessonCommand } from '@/modules/lessons/application/command/update-lesson.command';
import { DeleteLessonCommand } from '@/modules/lessons/application/command/delete-lesson.command';
import { GetLessonByIdQuery } from '@/modules/lessons/application/query/get-lesson-by-id.query';

const ALLOWED_THUMBNAIL_MIMES = ['image/png', 'image/jpeg', 'image/webp'];
const ALLOWED_THUMBNAIL_EXTS = ['.png', '.jpg', '.jpeg', '.webp'];
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB

@UseGuards(JwtAuthGuard)
@Controller('instructor/sections/:sectionId/lessons')
export class InstructorLessonController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** Ảnh xem trước: chỉ chấp nhận PNG/JPG/WebP, tối đa 5MB */
  private assertThumbnailFile(file?: Express.Multer.File) {
    if (!file || !file.buffer || file.buffer.length === 0) return;

    const extension = extname(file.originalname || '').toLowerCase();
    if (
      !ALLOWED_THUMBNAIL_MIMES.includes(file.mimetype) &&
      !ALLOWED_THUMBNAIL_EXTS.includes(extension)
    ) {
      throw new BadRequestException(
        'Ảnh xem trước không hợp lệ (chấp nhận PNG, JPG, WebP).',
      );
    }
    if (file.size > MAX_THUMBNAIL_SIZE) {
      throw new BadRequestException('Ảnh xem trước tối đa 5MB.');
    }
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetLessonByIdQuery(id));
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateLessonDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const video = files?.find((f) => f.fieldname === 'video');
    const thumbnail = files?.find((f) => f.fieldname === 'thumbnail');
    this.assertThumbnailFile(thumbnail);

    return this.commandBus.execute(
      new CreateLessonCommand(
        sectionId,
        dto.title,
        dto.type,
        dto.videoProvider,
        dto.videoSource,
        dto.duration,
        dto.content,
        dto.position,
        dto.isPreview,
        video,
        thumbnail,
      ),
    );
  }

  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const isPreviewBool =
      dto.isPreview !== undefined
        ? String(dto.isPreview) === 'true'
        : undefined;

    const video = files?.find((f) => f.fieldname === 'video');
    const thumbnail = files?.find((f) => f.fieldname === 'thumbnail');
    this.assertThumbnailFile(thumbnail);

    return this.commandBus.execute(
      new UpdateLessonCommand(id, {
        ...dto,
        isPreview: isPreviewBool,
        video,
        thumbnailFile: thumbnail,
      }),
    );
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteLessonCommand(id));
  }
}
