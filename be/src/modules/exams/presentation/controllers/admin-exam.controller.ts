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
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  IExamRepository,
  EXAM_REPOSITORY,
} from '../../domain/repository/exam.repository';
import {
  IExamFormatRepository,
  EXAM_FORMAT_REPOSITORY,
} from '../../domain/repository/exam-format.repository';
import {
  IExamFormatSectionRepository,
  EXAM_FORMAT_SECTION_REPOSITORY,
} from '../../domain/repository/exam-format-section.repository';
import {
  IExamSectionRepository,
  EXAM_SECTION_REPOSITORY,
} from '../../domain/repository/exam-section.repository';
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
import { Exam } from '../../domain/entity/exam.entity';
import { ExamStatus } from '../../domain/enums/exam-status.enum';
import { ExamSection } from '../../domain/entity/exam-section.entity';
import { ExamMaterial } from '../../domain/entity/exam-material.entity';
import { ExamQuestion } from '../../domain/entity/exam-question.entity';
import { ExamOption } from '../../domain/entity/exam-option.entity';
import { CreateExamDto } from '../dto/create-exam.dto';
import { UpdateExamDto } from '../dto/update-exam.dto';
import { CreateExamMaterialDto } from '../dto/create-exam-material.dto';
import { CreateExamQuestionDto } from '../dto/create-exam-question.dto';

@Controller('admin/exams')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminExamController {
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
    @Inject(EXAM_FORMAT_REPOSITORY)
    private readonly examFormatRepo: IExamFormatRepository,
    @Inject(EXAM_FORMAT_SECTION_REPOSITORY)
    private readonly examFormatSectionRepo: IExamFormatSectionRepository,
    @Inject(EXAM_SECTION_REPOSITORY)
    private readonly examSectionRepo: IExamSectionRepository,
    @Inject(EXAM_MATERIAL_REPOSITORY)
    private readonly examMaterialRepo: IExamMaterialRepository,
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly examQuestionRepo: IExamQuestionRepository,
    @Inject(EXAM_OPTION_REPOSITORY)
    private readonly examOptionRepo: IExamOptionRepository,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateExamDto,
    @CurrentUser('id') userId: number,
  ) {
    const format = await this.examFormatRepo.findById(dto.examFormatId);
    if (!format) {
      throw new NotFoundException('ExamFormat not found');
    }

    const exam = Exam.create({
      examFormatId: dto.examFormatId,
      title: dto.title,
      description: dto.description,
      isPremium: dto.isPremium,
      durationSeconds: dto.durationSeconds ?? format.durationSeconds,
      createdBy: userId,
    });

    const savedExam = await this.examRepo.create(exam);

    const formatSections =
      await this.examFormatSectionRepo.findByExamFormatId(dto.examFormatId);

    if (formatSections.length > 0) {
      const sections = formatSections.map((fs) =>
        ExamSection.create({
          examId: savedExam.id!,
          formatSectionId: fs.id!,
          code: fs.code,
          name: fs.name,
          instructions: fs.instructions,
          position: fs.position,
          durationSeconds: fs.durationSeconds,
        }),
      );
      await this.examSectionRepo.saveAll(sections);
    }

    const sections = await this.examSectionRepo.findByExamId(savedExam.id!);

    return { ...savedExam, sections };
  }

  @Get()
  async findAll() {
    return this.examRepo.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const exam = await this.examRepo.findById(id);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    const sections = await this.examSectionRepo.findByExamId(id);
    return { ...exam, sections };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamDto,
    @CurrentUser('id') userId: number,
  ) {
    const existing = await this.examRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Exam not found');
    }
    const entity = Exam.create({
      examFormatId: existing.examFormatId,
      title: dto.title ?? existing.title,
      description: dto.description ?? existing.description,
      isPremium: dto.isPremium ?? existing.isPremium,
      durationSeconds: dto.durationSeconds ?? existing.durationSeconds,
      createdBy: existing.createdBy,
    });
    entity.id = id;
    return this.examRepo.update(entity);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.examRepo.delete(id);
  }

  @Put(':id/publish')
  async publish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    const existing = await this.examRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Exam not found');
    }
    existing.update({ status: ExamStatus.PUBLISHED });
    return this.examRepo.update(existing);
  }

  @Put(':id/archive')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    const existing = await this.examRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Exam not found');
    }
    existing.update({ status: ExamStatus.ARCHIVED });
    return this.examRepo.update(existing);
  }

  @Post(':examId/materials')
  async createMaterial(
    @Param('examId', ParseIntPipe) examId: number,
    @Body() dto: CreateExamMaterialDto,
    @CurrentUser('id') userId: number,
  ) {
    const material = ExamMaterial.create({
      sectionId: examId,
      type: dto.type,
      title: dto.title,
      content: dto.content,
      fileUrl: dto.fileUrl,
      transcript: dto.transcript,
      position: dto.position,
    });
    return this.examMaterialRepo.save(material);
  }

  @Get(':examId/sections')
  async getSections(@Param('examId', ParseIntPipe) examId: number) {
    return this.examSectionRepo.findByExamId(examId);
  }

  @Post(':examId/sections/:sectionId/questions')
  async createQuestion(
    @Param('examId', ParseIntPipe) examId: number,
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

  @Get(':examId/sections/:sectionId/materials')
  async getMaterials(
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ) {
    return this.examMaterialRepo.findBySectionId(sectionId);
  }

  @Get(':examId/sections/:sectionId/questions')
  async getQuestions(
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ) {
    return this.examQuestionRepo.findBySectionId(sectionId);
  }
}
