import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { JwtOptionalAuthGuard } from '@/common/guards/jwt-optional.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetCourseQuestionsQuery } from '@/modules/course-questions/application/query/get-course-questions.query';
import { GetAdminQuestionDetailQuery } from '@/modules/course-questions/application/query/get-admin-question-detail.query';
import { CreateQuestionCommand } from '@/modules/course-questions/application/command/create-question.command';
import { AnswerQuestionCommand } from '@/modules/course-questions/application/command/answer-question.command';
import { AdminQuestionResponseMapper } from '@/modules/course-questions/presentation/mapper/admin-question-response.mapper';

@Controller()
export class StudentCourseQuestionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('courses/:courseId/questions')
  @UseGuards(JwtOptionalAuthGuard)
  async findCourseQuestions(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetCourseQuestionsQuery(courseId, {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        status: status !== undefined ? parseInt(status, 10) : undefined,
      }),
    );

    return {
      data: result.data.map((q: any) => ({
        id: q.id,
        content: q.content,
        status: q.status,
        lastActivityAt: q.lastActivityAt,
        createdAt: q.createdAt,
        user: q.user,
        answerCount: q.answerCount,
      })),
      meta: result.meta,
    };
  }

  @Post('courses/:courseId/questions')
  @UseGuards(JwtAuthGuard)
  async createQuestion(
    @CurrentUser('id') userId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body('content') content: string,
  ) {
    return this.commandBus.execute(
      new CreateQuestionCommand(courseId, userId, content),
    );
  }

  @Get('course-questions/:id')
  @UseGuards(JwtOptionalAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const question = await this.queryBus.execute(new GetAdminQuestionDetailQuery({ id }));
    return AdminQuestionResponseMapper.toResponse(question);
  }

  @Post('course-questions/:id/answers')
  @UseGuards(JwtAuthGuard)
  async createAnswer(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
  ) {
    return this.commandBus.execute(
      new AnswerQuestionCommand(id, userId, content),
    );
  }
}
