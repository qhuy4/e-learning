import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { UpdateLessonProgressCommand } from '../application/command/update-lesson-progress.command';
import { GetLessonProgressQuery } from '../application/query/get-lesson-progress.query';
import { GetCourseProgressQuery } from '../application/query/get-course-progress.query';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';
import { LessonProgress } from '../domain/entity/lesson-progress.entity';

interface AuthRequest extends Request {
  user: {
    id: number;
  };
}

@Controller('lesson-progress')
export class LessonProgressController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Patch()
  async updateLessonProgress(
    @Req() req: AuthRequest,
    @Body() dto: UpdateLessonProgressDto,
  ): Promise<LessonProgress> {
    const userId = 1;
    return this.commandBus.execute(
      new UpdateLessonProgressCommand(
        userId,
        dto.courseId,
        dto.lessonId,
        dto.watchSeconds,
        dto.progressPercent,
      ),
    );
  }

  @Get(':lessonId')
  async getLessonProgress(
    @Req() req: AuthRequest,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ): Promise<LessonProgress | null> {
    return this.queryBus.execute(
      new GetLessonProgressQuery(req.user.id, lessonId),
    );
  }

  @Get('course/:courseId')
  async getCourseProgress(
    @Req() req: AuthRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<{
    courseId: number;
    totalProgress: number;
    completedLessons: number;
    lessons: LessonProgress[];
  }> {
    return this.queryBus.execute(
      new GetCourseProgressQuery(req.user.id, courseId),
    );
  }
}
