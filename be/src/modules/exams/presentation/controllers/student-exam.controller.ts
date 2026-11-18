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
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { JwtOptionalAuthGuard } from '@/common/guards/jwt-optional.guard';
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
import {
  IExamSectionRepository,
  EXAM_SECTION_REPOSITORY,
} from '../../domain/repository/exam-section.repository';
import {
  IExamQuestionRepository,
  EXAM_QUESTION_REPOSITORY,
} from '../../domain/repository/exam-question.repository';
import {
  IExamQuestionGroupRepository,
  EXAM_QUESTION_GROUP_REPOSITORY,
} from '../../domain/repository/exam-question-group.repository';
import {
  IExamOptionRepository,
  EXAM_OPTION_REPOSITORY,
} from '../../domain/repository/exam-option.repository';
import { ExamStatus } from '../../domain/enums/exam-status.enum';
import { ExamAttemptStatus } from '../../domain/enums/exam-attempt-status.enum';
import { ExamAttempt } from '../../domain/entity/exam-attempt.entity';
import { ExamAnswer } from '../../domain/entity/exam-answer.entity';
import { ExamQuestion } from '../../domain/entity/exam-question.entity';
import { ExamOption } from '../../domain/entity/exam-option.entity';
import { QuestionType } from '../../domain/enums/question-type.enum';
import {
  SubmitExamAttemptDto,
  SubmitExamAnswerDto,
} from '../dto/submit-exam-attempt.dto';
import { GetStudentExamDetailQuery } from '../../application/query/get-student-exam-detail.query';

/**
 * Case / punctuation / whitespace-insensitive normalisation of typed answers —
 * mirrors `normalizeAnswer` in the FE so both sides grade identically.
 */
function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?"'()]/g, '')
    .replace(/\s+/g, ' ');
}

@Controller('student/exams')
export class StudentExamController {
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
    @Inject(EXAM_ATTEMPT_REPOSITORY)
    private readonly examAttemptRepo: IExamAttemptRepository,
    @Inject(EXAM_ANSWER_REPOSITORY)
    private readonly examAnswerRepo: IExamAnswerRepository,
    @Inject(EXAM_SECTION_REPOSITORY)
    private readonly examSectionRepo: IExamSectionRepository,
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly examQuestionRepo: IExamQuestionRepository,
    @Inject(EXAM_QUESTION_GROUP_REPOSITORY)
    private readonly examQuestionGroupRepo: IExamQuestionGroupRepository,
    @Inject(EXAM_OPTION_REPOSITORY)
    private readonly examOptionRepo: IExamOptionRepository,
    private readonly queryBus: QueryBus,
  ) {}

  /** Published exams for the listing — public (no token required). */
  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async findAll() {
    return this.examRepo.findPublishedWithTypeName();
  }

  /** Current user's latest attempts across all exams (titles + exam type name). */
  @Get('attempts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async myAttempts(@CurrentUser('id') userId: number) {
    const attempts = await this.examAttemptRepo.findByUserId(userId, 10);
    const withTitles = await Promise.all(
      attempts.map(async (attempt) => {
        // examTypeName cho client chọn giao diện đúng (TOEIC / IELTS / đề chung).
        const exam = await this.examRepo.findByIdWithTypeName(attempt.examId);
        return {
          ...attempt,
          examTitle: exam?.title ?? 'Đề thi',
          examTypeName: exam?.examTypeName ?? null,
        };
      }),
    );
    return withTitles;
  }

  /** Single published exam + examTypeName — public. */
  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const exam = await this.examRepo.findByIdWithTypeName(id);
    if (!exam || exam.status !== ExamStatus.PUBLISHED) {
      throw new NotFoundException('Exam not found');
    }
    return exam;
  }

  /** Nested sections -> questions -> options (questions include `explanation`) — public. */
  @Get(':id/detail')
  @UseGuards(JwtOptionalAuthGuard)
  async findDetail(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetStudentExamDetailQuery(id));
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
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

  /**
   * Submit an attempt with server-side grading:
   * - `isCorrect` per answer — choice questions: the selected option(s) must
   *   match the option(s) flagged `is_correct` (multi-select requires the
   *   exact correct set); text questions carrying an answer key: the typed
   *   `answerText` must equal one of the correct options (case / punctuation /
   *   whitespace-insensitive),
   * - `totalQuestions` = gradable questions — every choice question plus text
   *   questions that carry an answer key. Questions WITHOUT a key (essay,
   *   audio record …) are persisted as `answerText` but never graded, so they
   *   must not lower the score,
   * - `correctCount` = number of correctly answered questions,
   * - `score` = round(correctCount / totalQuestions * 100), 0 when empty.
   */
  @Post('attempts/:attemptId/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async submit(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Body() dto: SubmitExamAttemptDto,
  ) {
    const attempt = await this.examAttemptRepo.findById(attemptId);
    if (!attempt) {
      throw new NotFoundException('ExamAttempt not found');
    }

    // 1. Collect every question of this exam (direct + grouped).
    const questionById = new Map<number, ExamQuestion>();
    const sections = await this.examSectionRepo.findByExamId(attempt.examId);
    for (const section of sections) {
      if (section.id == null) continue;
      const directQuestions = await this.examQuestionRepo.findBySectionId(
        section.id,
      );
      for (const question of directQuestions) {
        if (question.id != null) questionById.set(question.id, question);
      }
      const groups = await this.examQuestionGroupRepo.findBySectionId(
        section.id,
      );
      for (const group of groups) {
        if (group.id == null) continue;
        const groupedQuestions = await this.examQuestionRepo.findByGroupId(
          group.id,
        );
        for (const question of groupedQuestions) {
          if (question.id != null) questionById.set(question.id, question);
        }
      }
    }

    // 2. Group the submitted answers per question (a multi-select question may
    //    arrive as several entries for the same questionId).
    const submittedByQuestion = new Map<number, SubmitExamAnswerDto[]>();
    for (const answer of dto.answers ?? []) {
      const existing = submittedByQuestion.get(answer.questionId);
      if (existing) existing.push(answer);
      else submittedByQuestion.set(answer.questionId, [answer]);
    }

    // 3. Grade each answered question against its options / answer key.
    //    NOTE: the DB enforces one answer row per (attempt, question), so all
    //    entries for the same question are merged into a single row while the
    //    correctness check considers every selected option (multi-select).
    const answersToSave: ExamAnswer[] = [];
    let correctCount = 0;

    const choiceTypes = new Set<QuestionType>([
      QuestionType.MULTIPLE_CHOICE,
      QuestionType.MULTI_SELECT,
      QuestionType.TRUE_FALSE,
    ]);

    // Prefetch the options of text questions — they carry the answer key
    // (correct options), used both to grade typed answers and to count
    // `totalQuestions` below.
    const textOptionsByQuestion = new Map<number, ExamOption[]>();
    for (const question of questionById.values()) {
      if (question.id == null || choiceTypes.has(question.type)) continue;
      textOptionsByQuestion.set(
        question.id,
        await this.examOptionRepo.findByQuestionId(question.id),
      );
    }
    const keyedTextIds = new Set(
      [...textOptionsByQuestion.entries()]
        .filter(([, options]) => options.some((option) => option.isCorrect))
        .map(([questionId]) => questionId),
    );

    for (const [questionId, items] of submittedByQuestion) {
      if (!questionById.has(questionId)) continue; // ignore foreign questions

      const options =
        textOptionsByQuestion.get(questionId) ??
        (await this.examOptionRepo.findByQuestionId(questionId));
      const correctOptionIds = new Set(
        options
          .filter((option) => option.isCorrect && option.id != null)
          .map((option) => option.id as number),
      );
      const selectedOptionIds = new Set<number>();
      let firstSelectedOptionId: number | null = null;
      let answerText: string | null = null;
      for (const item of items) {
        if (item.selectedOptionId != null) {
          // Option id "cũ" không còn tồn tại (admin vừa thay option / tab trình
          // duyệt để lâu) → không chèn vào DB (vi phạm FK) mà ghi nhận câu này
          // chưa chọn; nộp bài KHÔNG bị lỗi nữa.
          const optionStillExists = options.some(
            (o) => o.id === item.selectedOptionId,
          );
          if (optionStillExists) {
            selectedOptionIds.add(item.selectedOptionId);
            if (firstSelectedOptionId == null) {
              firstSelectedOptionId = item.selectedOptionId;
            }
          }
        }
        if (answerText == null && item.answerText != null) {
          answerText = item.answerText;
        }
      }

      // Choice questions — single choice: selected must be THE correct option;
      // multi-select: selected set must equal the set of correct options.
      const isChoiceCorrect =
        correctOptionIds.size > 0 &&
        selectedOptionIds.size === correctOptionIds.size &&
        Array.from(selectedOptionIds).every((id) => correctOptionIds.has(id));

      // Text questions — graded only when they carry an answer key: the typed
      // answer must equal one of the correct options (normalised comparison).
      // Key-less text (essay / audio record …) stays recorded, never graded.
      const typed = answerText == null ? '' : answerText.trim();
      const isTextCorrect =
        !isChoiceCorrect &&
        typed.length > 0 &&
        options.some(
          (option) =>
            option.isCorrect &&
            normalizeAnswer(option.content) === normalizeAnswer(typed),
        );

      const isCorrect = isChoiceCorrect || isTextCorrect;

      if (isCorrect) correctCount++;

      const points = questionById.get(questionId)?.points ?? 1;
      answersToSave.push(
        ExamAnswer.create({
          attemptId,
          questionId,
          selectedOptionId: firstSelectedOptionId,
          answerText,
          isCorrect,
          earnedPoints: isCorrect ? points : 0,
        }),
      );
    }

    // Gradable questions = every choice question + text questions carrying an
    // answer key — key-less text answers (essay / audio record …) never
    // shrink the score.
    const totalQuestions = [...questionById.values()].filter(
      (q) =>
        choiceTypes.has(q.type) || (q.id != null && keyedTextIds.has(q.id)),
    ).length;
    const score =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

    // 4. Persist the graded answers FIRST, then flip the attempt to SUBMITTED:
    //    nếu có lỗi giữa chừng thì attempt vẫn IN_PROGRESS và client gửi lại
    //    nguyên payload là tự lành (replace idempotent) — không còn cảnh trạng
    //    thái SUBMITTED mà answers đã bị xóa chưa chèn lại được.
    await this.examAnswerRepo.deleteByAttemptId(attemptId);
    if (answersToSave.length > 0) {
      await this.examAnswerRepo.saveAll(answersToSave);
    }

    attempt.update({
      status: ExamAttemptStatus.SUBMITTED,
      submittedAt: new Date(),
      score,
      correctCount,
      totalQuestions,
    });
    await this.examAttemptRepo.update(attempt);

    return attempt;
  }

  @Get('attempts/:attemptId/answers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async getAnswers(@Param('attemptId', ParseIntPipe) attemptId: number) {
    return this.examAnswerRepo.findByAttemptId(attemptId);
  }

  @Get(':examId/attempts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async getAttempts(
    @Param('examId', ParseIntPipe) examId: number,
    @CurrentUser('id') userId: number,
  ) {
    // Danh sách mọi attempt của user với đề này (mới nhất trước) — trang kết
    // quả dựng lại báo cáo từ attempt thật, không bịa dữ liệu.
    return this.examAttemptRepo.findByExamAndUserAll(examId, userId);
  }
}
