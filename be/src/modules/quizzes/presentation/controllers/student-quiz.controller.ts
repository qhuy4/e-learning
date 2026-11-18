import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { StartQuizCommand } from '../../application/command/start-quiz.command';
import { SubmitQuizCommand } from '../../application/command/submit-quiz.command';
import { GetStudentLessonQuizzesQuery, StudentLessonQuizItem } from '../../application/query/get-student-lesson-quizzes.query';
import { GetQuizAttemptHistoryQuery, QuizAttemptHistoryItem } from '../../application/query/get-quiz-attempt-history.query';
import { GetQuizAttemptReviewQuery, QuizAttemptReviewResult } from '../../application/query/get-quiz-attempt-review.query';
import { QuizAttempt } from '../../domain/entity/quiz-attempt.entity';
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
    return this.queryBus.execute<
      GetStudentLessonQuizzesQuery,
      StudentLessonQuizItem[]
    >(new GetStudentLessonQuizzesQuery(lessonId, studentId));
  }

  @Post(':quizId/start')
  async startQuiz(@Param('quizId') quizId: string, @CurrentUser('id') studentId: number) {
    return this.commandBus.execute<StartQuizCommand, QuizAttempt>(
      new StartQuizCommand(quizId, studentId.toString()),
    );
  }

  @Post('attempts/:attemptId/submit')
  async submitQuiz(@Param('attemptId') attemptId: string, @Body() dto: SubmitQuizDto, @CurrentUser('id') studentId: number) {
    return this.commandBus.execute<SubmitQuizCommand, QuizAttempt>(
      new SubmitQuizCommand(attemptId, studentId.toString(), dto),
    );
  }

  @Get(':quizId/history')
  async getAttemptHistory(@Param('quizId') quizId: string, @CurrentUser('id') studentId: number) {
    return this.queryBus.execute<
      GetQuizAttemptHistoryQuery,
      QuizAttemptHistoryItem[]
    >(new GetQuizAttemptHistoryQuery(Number(quizId), studentId));
  }

  @Get('attempts/:attemptId/review')
  async getAttemptReview(@Param('attemptId') attemptId: string, @CurrentUser('id') studentId: number) {
    return this.queryBus.execute<
      GetQuizAttemptReviewQuery,
      QuizAttemptReviewResult
    >(new GetQuizAttemptReviewQuery(Number(attemptId), studentId));
  }
}
