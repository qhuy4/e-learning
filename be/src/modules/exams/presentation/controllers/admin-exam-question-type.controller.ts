import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  IExamQuestionTypeRepository,
  EXAM_QUESTION_TYPE_REPOSITORY,
} from '../../domain/repository/exam-question-type.repository';
import { ExamQuestionType } from '../../domain/entity/exam-question-type.entity';
import { CreateExamQuestionTypeDto } from '../dto/create-exam-question-type.dto';
import { UpdateExamQuestionTypeDto } from '../dto/update-exam-question-type.dto';

@Controller('admin/exam-question-types')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminExamQuestionTypeController {
  constructor(
    @Inject(EXAM_QUESTION_TYPE_REPOSITORY)
    private readonly questionTypeRepo: IExamQuestionTypeRepository,
  ) {}

  @Post()
  async create(@Body() dto: CreateExamQuestionTypeDto) {
    const entity = ExamQuestionType.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
    });
    return this.questionTypeRepo.create(entity);
  }

  @Get()
  async findAll() {
    return this.questionTypeRepo.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questionTypeRepo.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamQuestionTypeDto,
  ) {
    const existing = await this.questionTypeRepo.findById(id);
    if (!existing) {
      throw new Error('ExamQuestionType not found');
    }
    const entity = ExamQuestionType.create({
      code: dto.code ?? existing.code,
      name: dto.name ?? existing.name,
      description: dto.description ?? existing.description,
    });
    entity.id = id;
    return this.questionTypeRepo.update(entity);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.questionTypeRepo.delete(id);
  }
}
