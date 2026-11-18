import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetInstructorQuestionsQuery } from '@/modules/course-questions/application/query/get-instructor-questions.query';
import { GetAdminQuestionDetailQuery } from '@/modules/course-questions/application/query/get-admin-question-detail.query';
import { AnswerQuestionCommand } from '@/modules/course-questions/application/command/answer-question.command';
import { UpdateQuestionStatusCommand } from '@/modules/course-questions/application/command/update-question-status.command';
import { AdminQuestionResponseMapper } from '@/modules/course-questions/presentation/mapper/admin-question-response.mapper';
import { InstructorQuestionsPage } from '@/modules/course-questions/application/query/get-instructor-questions.query';
import { AnswerQuestionResult } from '@/modules/course-questions/application/command/answer-question.command';
import { CourseQuestion } from '@/modules/course-questions/domain/entity/course-question.entity';

@UseGuards(JwtAuthGuard)
@Controller('instructor/course-questions')
export class InstructorCourseQuestionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @CurrentUser('id') instructorId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('courseId') courseId?: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
  ) {
    const result = await this.queryBus.execute<
      GetInstructorQuestionsQuery,
      InstructorQuestionsPage
    >(
      new GetInstructorQuestionsQuery(instructorId, {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        courseId: courseId ? parseInt(courseId, 10) : undefined,
        status: status !== undefined ? parseInt(status, 10) : undefined,
        keyword,
      }),
    );

    return {
      data: result.data.map((q) => AdminQuestionResponseMapper.toResponse(q)),
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(
    @CurrentUser('id') instructorId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const question = await this.queryBus.execute<
      GetAdminQuestionDetailQuery,
      CourseQuestion
    >(new GetAdminQuestionDetailQuery({ id }));
    return AdminQuestionResponseMapper.toResponse(question);
  }

  @Post(':id/answers')
  async createAnswer(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
  ) {
    return this.commandBus.execute<AnswerQuestionCommand, AnswerQuestionResult>(
      new AnswerQuestionCommand(id, userId, content),
    );
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.commandBus.execute<UpdateQuestionStatusCommand, CourseQuestion>(
      new UpdateQuestionStatusCommand({ id, status }),
    );
  }
}
