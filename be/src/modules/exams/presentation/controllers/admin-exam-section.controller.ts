import {
  Controller,
  Get,
  Post,
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
  IExamMaterialRepository,
  EXAM_MATERIAL_REPOSITORY,
} from '../../domain/repository/exam-material.repository';
import {
  IExamQuestionRepository,
  EXAM_QUESTION_REPOSITORY,
} from '../../domain/repository/exam-question.repository';
import {
  IExamOptionRepository,
  EXAM_OPTION_REPOSITORY,
} from '../../domain/repository/exam-option.repository';
import { ExamMaterial } from '../../domain/entity/exam-material.entity';
import { ExamQuestion } from '../../domain/entity/exam-question.entity';
import { ExamOption } from '../../domain/entity/exam-option.entity';
import { CreateExamMaterialDto } from '../dto/create-exam-material.dto';
import { CreateExamQuestionDto } from '../dto/create-exam-question.dto';

@Controller('admin/exam-sections')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminExamSectionController {
  constructor(
    @Inject(EXAM_MATERIAL_REPOSITORY)
    private readonly examMaterialRepo: IExamMaterialRepository,
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly examQuestionRepo: IExamQuestionRepository,
    @Inject(EXAM_OPTION_REPOSITORY)
    private readonly examOptionRepo: IExamOptionRepository,
  ) {}

  @Get(':sectionId/materials')
  async getMaterials(
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ) {
    return this.examMaterialRepo.findBySectionId(sectionId);
  }

  @Post(':sectionId/materials')
  async createMaterial(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateExamMaterialDto,
    @CurrentUser('id') userId: number,
  ) {
    const material = ExamMaterial.create({
      sectionId,
      type: dto.type,
      title: dto.title,
      content: dto.content,
      fileUrl: dto.fileUrl,
      transcript: dto.transcript,
      position: dto.position,
    });
    return this.examMaterialRepo.save(material);
  }

  @Get(':sectionId/questions')
  async getQuestions(
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ) {
    return this.examQuestionRepo.findBySectionId(sectionId);
  }

  @Post(':sectionId/questions')
  async createQuestion(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateExamQuestionDto,
    @CurrentUser('id') userId: number,
  ) {
    const question = ExamQuestion.create({
      sectionId,
      materialId: dto.materialId,
      questionTypeId: dto.questionTypeId,
      question: dto.question,
      explanation: dto.explanation,
      points: dto.points,
      position: dto.position,
    });

    const savedQuestion = await this.examQuestionRepo.save(question);

    if (dto.options && dto.options.length > 0) {
      const options = dto.options.map((o) =>
        ExamOption.create({
          questionId: savedQuestion.id!,
          content: o.content,
          isCorrect: o.isCorrect,
          position: o.position,
        }),
      );
      await this.examOptionRepo.saveAll(options);
    }

    return savedQuestion;
  }

  @Get(':sectionId/questions/:questionId/options')
  async getOptions(
    @Param('questionId', ParseIntPipe) questionId: number,
  ) {
    return this.examOptionRepo.findByQuestionId(questionId);
  }
}
