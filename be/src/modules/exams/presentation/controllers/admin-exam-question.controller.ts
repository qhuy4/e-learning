import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  IExamQuestionRepository,
  EXAM_QUESTION_REPOSITORY,
} from '../../domain/repository/exam-question.repository';
import {
  IExamOptionRepository,
  EXAM_OPTION_REPOSITORY,
} from '../../domain/repository/exam-option.repository';
import { ExamQuestion } from '../../domain/entity/exam-question.entity';
import { UpdateExamQuestionDto } from '../dto/update-exam-question.dto';

@Controller('admin/exam-questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminExamQuestionController {
  constructor(
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly examQuestionRepo: IExamQuestionRepository,
    @Inject(EXAM_OPTION_REPOSITORY)
    private readonly examOptionRepo: IExamOptionRepository,
  ) {}

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamQuestionDto,
    @CurrentUser('id') userId: number,
  ) {
    const existing = await this.examQuestionRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('ExamQuestion not found');
    }
    const entity = ExamQuestion.create({
      sectionId: existing.sectionId,
      materialId: dto.materialId ?? existing.materialId,
      questionTypeId: dto.questionTypeId ?? existing.questionTypeId,
      question: dto.question ?? existing.question,
      explanation: dto.explanation ?? existing.explanation,
      points: dto.points ?? existing.points,
      position: dto.position ?? existing.position,
    });
    entity.id = id;
    return this.examQuestionRepo.save(entity);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.examQuestionRepo.delete(id);
  }

  @Get(':questionId/options')
  async getOptions(
    @Param('questionId', ParseIntPipe) questionId: number,
  ) {
    return this.examOptionRepo.findByQuestionId(questionId);
  }
}
