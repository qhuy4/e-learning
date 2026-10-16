import { Controller, Get, Param, ParseIntPipe, Query, Req, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { GetLessonByIdQuery } from '../application/query/get-lesson-by-id.query';
import { GetLessonBySlugQuery } from '../application/query/get-lesson-by-slug.query';
import { PreviewLessonQuery } from '../application/query/preview-lesson.query';
import { Request } from 'express';

@Controller('lessons')
export class LessonPublicController {
  private readonly logger = new Logger(LessonPublicController.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

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

  @Get('slug/:slug')
  getBySlug(
    @Param('slug') slug: string,
    @Query('courseSlug') courseSlug: string | undefined,
    @Req() req: Request,
  ) {
    let userId: number | undefined;
    const authHeader = req.headers.authorization;
    this.logger.debug(`GET slug/${slug} - Authorization: ${authHeader ? 'present (length=' + authHeader.length + ')' : 'MISSING'}`);

    try {
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = this.jwtService.verify(token);
        userId = Number(payload.sub ?? payload.id);
        this.logger.debug(`JWT verified: userId=${userId}, sub=${payload.sub}`);
      } else {
        this.logger.warn(`No Bearer token for slug/${slug}`);
      }
    } catch (err) {
      this.logger.warn(`JWT verification FAILED for slug/${slug}: ${err}`);
    }
    return this.queryBus.execute(
      new GetLessonBySlugQuery(slug, userId, courseSlug),
    );
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetLessonByIdQuery(id));
  }
}
