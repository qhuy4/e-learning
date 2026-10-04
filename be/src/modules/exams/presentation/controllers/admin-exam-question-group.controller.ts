import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards, Inject, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { IExamQuestionGroupRepository, EXAM_QUESTION_GROUP_REPOSITORY } from '../../domain/repository/exam-question-group.repository';
import { IExamQuestionRepository, EXAM_QUESTION_REPOSITORY } from '../../domain/repository/exam-question.repository';
import { IExamOptionRepository, EXAM_OPTION_REPOSITORY } from '../../domain/repository/exam-option.repository';
import { IExamSectionRepository, EXAM_SECTION_REPOSITORY } from '../../domain/repository/exam-section.repository';
import { ExamQuestionGroup } from '../../domain/entity/exam-question-group.entity';
import { ExamQuestion } from '../../domain/entity/exam-question.entity';
import { ExamOption } from '../../domain/entity/exam-option.entity';

@Controller('admin/exam-question-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminExamQuestionGroupController {
  constructor(
    @Inject(EXAM_QUESTION_GROUP_REPOSITORY) private readonly groupRepo: IExamQuestionGroupRepository,
    @Inject(EXAM_QUESTION_REPOSITORY) private readonly questionRepo: IExamQuestionRepository,
    @Inject(EXAM_OPTION_REPOSITORY) private readonly optionRepo: IExamOptionRepository,
    @Inject(EXAM_SECTION_REPOSITORY) private readonly sectionRepo: IExamSectionRepository,
  ) {}

  @Get('section/:sectionId')
  async findBySection(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.groupRepo.findBySectionId(sectionId);
  }

  @Post('section/:sectionId')
  async create(@Param('sectionId', ParseIntPipe) sectionId: number, @Body() dto: any) {
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

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    const existing = await this.groupRepo.findById(id);
    if (!existing) throw new NotFoundException('Group not found');
    existing.update({ groupType: dto.groupType, title: dto.title, instructions: dto.instructions, position: dto.position });
    return this.groupRepo.save(existing);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.groupRepo.delete(id);
    return { success: true };
  }

  @Get(':groupId/questions')
  async getQuestions(@Param('groupId', ParseIntPipe) groupId: number) {
    const questions = await this.questionRepo.findByGroupId(groupId);
    return Promise.all(
      questions.map(async (question) => ({
        ...question,
        options: await this.optionRepo.findByQuestionId(question.id!),
      })),
    );
  }

  @Post(':groupId/questions')
  async createQuestion(@Param('groupId', ParseIntPipe) groupId: number, @Body() dto: any) {
    const group = await this.groupRepo.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    const question = ExamQuestion.create({
      sectionId: group.sectionId,
      groupId,
      type: dto.type,
      question: dto.question,
      explanation: dto.explanation,
      points: dto.points,
      position: dto.position ?? 0,
    });
    const saved = await this.questionRepo.save(question);
    if (dto.options && dto.options.length > 0) {
      const options = dto.options.map((o: any) => ExamOption.create({
        questionId: saved.id!, content: o.content, isCorrect: o.isCorrect, position: o.position,
      }));
      await this.optionRepo.saveAll(options);
    }

    // section.questionCount stays the target count coming from the exam format.
    return saved;
  }

  @Put('questions/:questionId')
  async updateQuestion(@Param('questionId', ParseIntPipe) questionId: number, @Body() dto: any) {
    const existing = await this.questionRepo.findById(questionId);
    if (!existing) throw new NotFoundException('Question not found');
    existing.update({ type: dto.type, question: dto.question, explanation: dto.explanation, points: dto.points, position: dto.position });
    const saved = await this.questionRepo.save(existing);

    // Replace options when the client sends them (partial updates keep the old ones).
    if (dto.options !== undefined) {
      await this.optionRepo.deleteAllByQuestionId(questionId);
      if (dto.options.length > 0) {
        const options = dto.options.map((o: any) => ExamOption.create({
          questionId: saved.id!, content: o.content, isCorrect: o.isCorrect, position: o.position,
        }));
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

  @Get('questions/:questionId/options')
  async getOptions(@Param('questionId', ParseIntPipe) questionId: number) {
    return this.optionRepo.findByQuestionId(questionId);
  }
}
