import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UpdateLessonProgressCommand } from '../application/command/update-lesson-progress.command';
import { GetLessonProgressQuery } from '../application/query/get-lesson-progress.query';
import { GetCourseProgressQuery } from '../application/query/get-course-progress.query';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';
import { LessonProgress } from '../domain/entity/lesson-progress.entity';

@Controller('lesson-progress')
@UseGuards(JwtAuthGuard)
export class LessonProgressController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Patch()
  async updateLessonProgress(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateLessonProgressDto,
  ): Promise<LessonProgress> {
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
    @CurrentUser('id') userId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ): Promise<LessonProgress | null> {
    return this.queryBus.execute(
      new GetLessonProgressQuery(userId, lessonId),
    );
  }

  @Get('course/:courseId')
  async getCourseProgress(
    @CurrentUser('id') userId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.queryBus.execute(
      new GetCourseProgressQuery(userId, courseId),
    );
  }
}
