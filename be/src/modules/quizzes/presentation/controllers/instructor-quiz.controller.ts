import { Controller, Get, Post, Delete, Put, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AttachQuizToLessonCommand } from '../../application/command/attach-quiz-to-lesson.command';
import { DetachQuizFromLessonCommand } from '../../application/command/detach-quiz-from-lesson.command';
import { GetMyQuizzesQuery } from '../../application/query/get-my-quizzes.query';
import { GetLessonQuizzesQuery, LessonQuizzesResult } from '../../application/query/get-lesson-quizzes.query';
import { GetQuizByIdQuery, QuizWithQuestions } from '../../application/query/get-quiz-by-id.query';
import { AttachQuizDto } from '../dto/attach-quiz.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { CreateQuizCommand } from '../../application/command/create-quiz.command';
import { UpdateQuizDto } from '../dto/update-quiz.dto';
import { UpdateQuizCommand } from '../../application/command/update-quiz.command';
import { DeleteQuizCommand } from '../../application/command/delete-quiz.command';
import { Quiz } from '../../domain/entity/quiz.entity';
import { LessonQuiz } from '../../domain/entity/lesson-quiz.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.INSTRUCTOR)
@Controller('instructor/quizzes')
export class InstructorQuizController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  async create(@Body() dto: CreateQuizDto, @CurrentUser('id') teacherId: number) {
    return this.commandBus.execute<CreateQuizCommand, Quiz>(
      new CreateQuizCommand(dto, teacherId.toString()),
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateQuizDto, @CurrentUser('id') teacherId: number) {
    return this.commandBus.execute<UpdateQuizCommand, Quiz>(
      new UpdateQuizCommand(id, teacherId.toString(), dto),
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') teacherId: number) {
    return this.commandBus.execute<DeleteQuizCommand, { success: boolean }>(
      new DeleteQuizCommand(id, teacherId.toString()),
    );
  }

  @Get('my-quizzes')
  async getMyQuizzes(@CurrentUser('id') teacherId: number) {
    return this.queryBus.execute<GetMyQuizzesQuery, Quiz[]>(
      new GetMyQuizzesQuery(teacherId.toString()),
    );
  }

  @Get('lesson/:lessonId')
  async getLessonQuizzes(@Param('lessonId') lessonId: string) {
    return this.queryBus.execute<GetLessonQuizzesQuery, LessonQuizzesResult>(
      new GetLessonQuizzesQuery(lessonId),
    );
  }

  @Get(':id')
  async getQuizById(@Param('id') id: string) {
    return this.queryBus.execute<GetQuizByIdQuery, QuizWithQuestions>(
      new GetQuizByIdQuery(id),
    );
  }

  @Post(':quizId/attach')
  async attachToLesson(@Param('quizId') quizId: string, @Body() dto: AttachQuizDto, @CurrentUser('id') teacherId: number) {
    return this.commandBus.execute<AttachQuizToLessonCommand, LessonQuiz>(
      new AttachQuizToLessonCommand(quizId, dto.lessonId, teacherId.toString()),
    );
  }

  @Delete(':quizId/detach/:lessonId')
  async detachFromLesson(@Param('quizId') quizId: string, @Param('lessonId') lessonId: string, @CurrentUser('id') teacherId: number) {
    return this.commandBus.execute<
      DetachQuizFromLessonCommand,
      { success: boolean }
    >(
      new DetachQuizFromLessonCommand(quizId, lessonId, teacherId.toString()),
    );
  }
}
