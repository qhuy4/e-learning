import {
  Controller,
  Get,
  Post,
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
  IExamAttemptRepository,
  EXAM_ATTEMPT_REPOSITORY,
} from '../../domain/repository/exam-attempt.repository';
import {
  IExamAnswerRepository,
  EXAM_ANSWER_REPOSITORY,
} from '../../domain/repository/exam-answer.repository';
import { ExamStatus } from '../../domain/enums/exam-status.enum';
import { ExamAttemptStatus } from '../../domain/enums/exam-attempt-status.enum';
import { ExamAttempt } from '../../domain/entity/exam-attempt.entity';
import { ExamAnswer } from '../../domain/entity/exam-answer.entity';
import { SubmitExamAttemptDto } from '../dto/submit-exam-attempt.dto';

@Controller('student/exams')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class StudentExamController {
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
    @Inject(EXAM_ATTEMPT_REPOSITORY)
    private readonly examAttemptRepo: IExamAttemptRepository,
    @Inject(EXAM_ANSWER_REPOSITORY)
    private readonly examAnswerRepo: IExamAnswerRepository,
  ) {}

  @Get()
  async findAll() {
    return this.examRepo.findByStatus(ExamStatus.PUBLISHED);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const exam = await this.examRepo.findById(id);
    if (!exam || exam.status !== ExamStatus.PUBLISHED) {
      throw new NotFoundException('Exam not found');
    }
    return exam;
  }

  @Post(':id/start')
  async start(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    const exam = await this.examRepo.findById(id);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const existingAttempt = await this.examAttemptRepo.findByExamAndUser(
      id,
      userId,
    );

    if (
      existingAttempt &&
      existingAttempt.status !== ExamAttemptStatus.SUBMITTED
    ) {
      return existingAttempt;
    }

    const attempt = ExamAttempt.create({
      examId: id,
      userId,
    });

    return this.examAttemptRepo.create(attempt);
  }

  @Post('attempts/:attemptId/submit')
  async submit(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Body() dto: SubmitExamAttemptDto,
    @CurrentUser('id') userId: number,
  ) {
    const attempt = await this.examAttemptRepo.findById(attemptId);
    if (!attempt) {
      throw new NotFoundException('ExamAttempt not found');
    }

    attempt.update({
      status: ExamAttemptStatus.SUBMITTED,
      submittedAt: new Date(),
    });
    await this.examAttemptRepo.update(attempt);

    if (dto.answers && dto.answers.length > 0) {
      const answers = dto.answers.map((a) =>
        ExamAnswer.create({
          attemptId,
          questionId: a.questionId,
          selectedOptionId: a.selectedOptionId,
          answerText: a.answerText,
        }),
      );
      await this.examAnswerRepo.saveAll(answers);
    }

    return attempt;
  }

  @Get('attempts/:attemptId/answers')
  async getAnswers(
    @Param('attemptId', ParseIntPipe) attemptId: number,
  ) {
    return this.examAnswerRepo.findByAttemptId(attemptId);
  }

  @Get(':examId/attempts')
  async getAttempts(
    @Param('examId', ParseIntPipe) examId: number,
    @CurrentUser('id') userId: number,
  ) {
    const attempt = await this.examAttemptRepo.findByExamAndUser(
      examId,
      userId,
    );
    return attempt ? [attempt] : [];
  }
}
