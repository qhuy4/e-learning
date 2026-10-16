import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuizCommand } from '../../application/command/create-quiz.command';
import { UpdateQuizCommand } from '../../application/command/update-quiz.command';
import { DeleteQuizCommand } from '../../application/command/delete-quiz.command';
import { AttachQuizToLessonCommand } from '../../application/command/attach-quiz-to-lesson.command';
import { DetachQuizFromLessonCommand } from '../../application/command/detach-quiz-from-lesson.command';
import { GetQuizByIdQuery } from '../../application/query/get-quiz-by-id.query';
import { GetQuizListQuery } from '../../application/query/get-quiz-list.query';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { UpdateQuizDto } from '../dto/update-quiz.dto';
import { AttachQuizDto } from '../dto/attach-quiz.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/quizzes')
export class AdminQuizController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  async create(@Body() dto: CreateQuizDto, @CurrentUser('id') adminId: number) {
    return this.commandBus.execute(new CreateQuizCommand(dto, adminId.toString()));
  }

  @Get()
  async findAll() {
    return this.queryBus.execute(new GetQuizListQuery());
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetQuizByIdQuery(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
    return this.commandBus.execute(new UpdateQuizCommand(id, null, dto));
  }

  // Admin attach/detach: userId = null bypasses ownership check (admin manages all quizzes)
  @Post(':quizId/attach')
  async attachToLesson(@Param('quizId') quizId: string, @Body() dto: AttachQuizDto) {
    return this.commandBus.execute(new AttachQuizToLessonCommand(quizId, dto.lessonId, null));
  }

  @Delete(':quizId/detach/:lessonId')
  async detachFromLesson(@Param('quizId') quizId: string, @Param('lessonId') lessonId: string) {
    return this.commandBus.execute(new DetachQuizFromLessonCommand(quizId, lessonId, null));
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteQuizCommand(id, null));
  }
}
