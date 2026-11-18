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
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import {
  IExamQuestionGroupRepository,
  EXAM_QUESTION_GROUP_REPOSITORY,
} from '../../domain/repository/exam-question-group.repository';
import {
  IExamQuestionRepository,
  EXAM_QUESTION_REPOSITORY,
} from '../../domain/repository/exam-question.repository';
import {
  IExamOptionRepository,
  EXAM_OPTION_REPOSITORY,
} from '../../domain/repository/exam-option.repository';
import {
  IExamSectionRepository,
  EXAM_SECTION_REPOSITORY,
} from '../../domain/repository/exam-section.repository';
import { ExamQuestionGroup } from '../../domain/entity/exam-question-group.entity';
import { ExamQuestion } from '../../domain/entity/exam-question.entity';
import { ExamOption } from '../../domain/entity/exam-option.entity';
import {
  ExamGroupBody,
  ExamQuestionBody,
} from '../../presentation/dto/admin-exam-question-body.interface';

@Controller('admin/exam-sections')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminExamSectionController {
  constructor(
    @Inject(EXAM_QUESTION_GROUP_REPOSITORY)
    private readonly groupRepo: IExamQuestionGroupRepository,
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly questionRepo: IExamQuestionRepository,
    @Inject(EXAM_OPTION_REPOSITORY)
    private readonly optionRepo: IExamOptionRepository,
    @Inject(EXAM_SECTION_REPOSITORY)
    private readonly sectionRepo: IExamSectionRepository,
  ) {}

  @Get(':sectionId/groups')
  async getGroups(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.groupRepo.findBySectionId(sectionId);
  }

  @Post(':sectionId/groups')
  async createGroup(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: ExamGroupBody,
  ) {
    // Position is assigned server-side (max + 1 within the section) so client
    // caches/stale lists can never violate UNIQUE (section_id, position).
    const existing = await this.groupRepo.findBySectionId(sectionId);
    const nextPosition = existing.reduce((max, g) => Math.max(max, g.position), 0) + 1;
    const group = ExamQuestionGroup.create({
      sectionId,
      groupType: dto.groupType,
      title: dto.title,
      instructions: dto.instructions,
      position: nextPosition,
    });
    return this.groupRepo.save(group);
  }

  @Put('groups/:groupId')
  async updateGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: ExamGroupBody,
  ) {
    const existing = await this.groupRepo.findById(groupId);
    if (!existing) throw new BadRequestException('Group not found');
    existing.update({ groupType: dto.groupType, title: dto.title, instructions: dto.instructions, position: dto.position });
    return this.groupRepo.save(existing);
  }

  @Delete('groups/:groupId')
  async removeGroup(@Param('groupId', ParseIntPipe) groupId: number) {
    await this.groupRepo.delete(groupId);
    return { success: true };
  }

  @Get(':sectionId/questions')
  async getDirectQuestions(@Param('sectionId', ParseIntPipe) sectionId: number) {
    const questions = await this.questionRepo.findBySectionId(sectionId);
    return Promise.all(
      questions.map(async (question) => ({
        ...question,
        options: await this.optionRepo.findByQuestionId(question.id!),
      })),
    );
  }

  @Post(':sectionId/questions')
  async createDirectQuestion(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: ExamQuestionBody,
  ) {
    const question = ExamQuestion.create({
      sectionId,
      type: dto.type,
      question: dto.question,
      explanation: dto.explanation,
      points: dto.points,
      position: dto.position ?? 0,
    });
    const saved = await this.questionRepo.save(question);

    if (dto.options && dto.options.length > 0) {
      const options = dto.options.map((o) => ExamOption.create({
        questionId: saved.id!, content: o.content, isCorrect: o.isCorrect, position: o.position,
      }));
      await this.optionRepo.saveAll(options);
    }

    // section.questionCount stays the target count coming from the exam format.
    return saved;
  }

  @Put('questions/:questionId')
  async updateQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() dto: ExamQuestionBody,
  ) {
    const existing = await this.questionRepo.findById(questionId);
    if (!existing) throw new BadRequestException('Question not found');
    existing.update({
      sectionId: dto.sectionId,
      groupId: dto.groupId,
      type: dto.type,
      question: dto.question,
      explanation: dto.explanation,
      points: dto.points,
      position: dto.position,
    });
    const saved = await this.questionRepo.save(existing);

    // Replace options when the client sends them (partial updates keep the old ones).
    if (dto.options !== undefined) {
      await this.optionRepo.deleteAllByQuestionId(questionId);
      if (dto.options.length > 0) {
        const options = dto.options.map((o) =>
          ExamOption.create({
            questionId: saved.id!,
            content: o.content,
            isCorrect: o.isCorrect,
            position: o.position,
          }),
        );
        await this.optionRepo.saveAll(options);
      }
    }

    return saved;
  }

  @Delete('questions/:questionId')
  async removeQuestion(@Param('questionId', ParseIntPipe) questionId: number) {
    await this.questionRepo.delete(questionId);
    return { success: true };
  }
}
