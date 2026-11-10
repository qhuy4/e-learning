import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { StartQuizCommand } from '../../application/command/start-quiz.command';
import { SubmitQuizCommand } from '../../application/command/submit-quiz.command';
import { GetStudentLessonQuizzesQuery } from '../../application/query/get-student-lesson-quizzes.query';
import { GetQuizAttemptHistoryQuery } from '../../application/query/get-quiz-attempt-history.query';
import { GetQuizAttemptReviewQuery } from '../../application/query/get-quiz-attempt-review.query';
import { SubmitQuizDto } from '../dto/submit-quiz.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
@Controller('student/quizzes')
export class StudentQuizController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get('lesson/:lessonId')
  async getLessonQuizzes(@Param('lessonId') lessonId: string, @CurrentUser('id') studentId: number) {
    return this.queryBus.execute(new GetStudentLessonQuizzesQuery(lessonId, studentId));
  }

  @Post(':quizId/start')
  async startQuiz(@Param('quizId') quizId: string, @CurrentUser('id') studentId: number) {
    return this.commandBus.execute(new StartQuizCommand(quizId, studentId.toString()));
  }

  @Post('attempts/:attemptId/submit')
  async submitQuiz(@Param('attemptId') attemptId: string, @Body() dto: SubmitQuizDto, @CurrentUser('id') studentId: number) {
    return this.commandBus.execute(new SubmitQuizCommand(attemptId, studentId.toString(), dto));
  }

  @Get(':quizId/history')
  async getAttemptHistory(@Param('quizId') quizId: string, @CurrentUser('id') studentId: number) {
    return this.queryBus.execute(
      new GetQuizAttemptHistoryQuery(Number(quizId), studentId),
    );
  }

  @Get('attempts/:attemptId/review')
  async getAttemptReview(@Param('attemptId') attemptId: string, @CurrentUser('id') studentId: number) {
    return this.queryBus.execute(
      new GetQuizAttemptReviewQuery(Number(attemptId), studentId),
    );
  }
}
