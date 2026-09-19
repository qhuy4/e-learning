import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuizCommand } from '../../application/command/create-quiz.command';
import { UpdateQuizCommand } from '../../application/command/update-quiz.command';
import { DeleteQuizCommand } from '../../application/command/delete-quiz.command';
import { GetQuizByIdQuery } from '../../application/query/get-quiz-by-id.query';
import { GetQuizListQuery } from '../../application/query/get-quiz-list.query';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { UpdateQuizDto } from '../dto/update-quiz.dto';
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

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteQuizCommand(id, null));
  }
}
