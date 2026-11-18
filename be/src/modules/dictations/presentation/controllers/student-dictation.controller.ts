import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetDictationByIdQuery } from '../../application/query/get-dictation-by-id.query';
import { StartDictationCommand } from '../../application/command/start-dictation.command';
import { SubmitDictationCommand } from '../../application/command/submit-dictation.command';
import { DictationAnswerInput } from '../../application/dictation-input.interface';
import { DictationDetail } from '../../application/query/get-dictation-by-id.query';
import { Dictation } from '../../domain/entity/dictation.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
@Controller('student/dictations')
export class StudentDictationController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.queryBus.execute<GetDictationByIdQuery, DictationDetail>(
      new GetDictationByIdQuery(id),
    );
  }

  @Post(':id/start')
  async startDictation(@Param('id') id: string, @CurrentUser('id') studentId: number) {
    return this.commandBus.execute<StartDictationCommand, Dictation>(
      new StartDictationCommand(id, studentId.toString()),
    );
  }

  @Post(':attemptId/submit')
  async submitDictation(
    @Param('attemptId') attemptId: string,
    @Body() dto: { answers: DictationAnswerInput[] },
    @CurrentUser('id') studentId: number,
  ) {
    return this.commandBus.execute<
      SubmitDictationCommand,
      { success: boolean; accuracy: number }
    >(new SubmitDictationCommand(attemptId, studentId.toString(), dto.answers));
  }
}
