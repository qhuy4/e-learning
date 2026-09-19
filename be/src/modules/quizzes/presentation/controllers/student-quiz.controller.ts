import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { StartQuizCommand } from '../../application/command/start-quiz.command';
import { SubmitQuizCommand } from '../../application/command/submit-quiz.command';
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

  @Post(':quizId/start')
  async startQuiz(@Param('quizId') quizId: string, @CurrentUser('id') studentId: number) {
    return this.commandBus.execute(new StartQuizCommand(quizId, studentId.toString()));
  }

  @Post('attempts/:attemptId/submit')
  async submitQuiz(@Param('attemptId') attemptId: string, @Body() dto: SubmitQuizDto, @CurrentUser('id') studentId: number) {
    return this.commandBus.execute(new SubmitQuizCommand(attemptId, studentId.toString(), dto));
  }
}
