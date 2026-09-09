import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetLessonByIdQuery } from '../application/query/get-lesson-by-id.query';
import { GetLessonBySlugQuery } from '../application/query/get-lesson-by-slug.query';
import { PreviewLessonQuery } from '../application/query/preview-lesson.query';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/domain/entity/user.entity';

@Controller('lessons')
export class LessonPublicController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('preview')
  previewLesson(
    @Query('token') token: string,
    @Query('lessonId') lessonId?: number,
    @Query('lessonSlug') lessonSlug?: string,
  ) {
    return this.queryBus.execute(
      new PreviewLessonQuery(token, lessonId ? Number(lessonId) : undefined, lessonSlug),
    );
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetLessonByIdQuery(id));
  }

  @Get('slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.queryBus.execute(new GetLessonBySlugQuery(slug));
  }
}
