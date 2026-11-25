import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { LearnerProfileService } from '@/modules/student-assessment/application/learner-profile.service';
import { QuizScoreDto } from '@/modules/student-assessment/presentation/dto/quiz-score.dto';
import { SelfAssessmentDto } from '@/modules/student-assessment/presentation/dto/self-assessment.dto';
import { ListeningScoreDto } from '@/modules/student-assessment/presentation/dto/listening-score.dto';
import { RoadmapService } from '@/modules/student-assessment/application/roadmap.service';

/** Giới hạn seed mà model service sinh ra (random.randrange(10**9)). */
const MAX_FORM_SEED = 999_999_999;

/**
 * Skill match MVP:
 *   Bước 1  POST   /student-assessment/self-assessment
 *   Bước 2  GET    /student-assessment/quiz/form  (+ POST quiz/score)
 *            POST   /student-assessment/analyze    (writing — giữ nguyên)
 *   Bước 3  GET    /student-assessment/profile
 */
@Controller('student-assessment')
@UseGuards(JwtAuthGuard)
export class LearnerProfileController {
  constructor(
    private readonly profile: LearnerProfileService,
    private readonly roadmaps: RoadmapService,
  ) {}

  /** Form quiz cloze (proxy model /vocab/form) — không lộ đáp án. */
  @Get('quiz/form')
  quizForm(@Query('seed') seed?: string) {
    return this.profile.quizForm(parseSeed(seed));
  }

  /** Chấm + lưu bài quiz (partial hợp lệ). */
  @Post('quiz/score')
  quizScore(@CurrentUser('id') userId: number, @Body() dto: QuizScoreDto) {
    return this.profile.quizScore(userId, dto);
  }

  /** Bài quiz gần nhất (null nếu chưa làm). */
  @Get('quiz/latest')
  latestQuiz(@CurrentUser('id') userId: number) {
    return this.profile.latestQuiz(userId);
  }

  /** Form Listening MVP — đáp án chỉ tồn tại ở backend. */
  @Get('listening/form')
  listeningForm(@CurrentUser('id') userId: number) {
    return this.profile.listeningForm(userId);
  }

  /** Chấm và lưu lần làm Listening. */
  @Post('listening/score')
  listeningScore(
    @CurrentUser('id') userId: number,
    @Body() dto: ListeningScoreDto,
  ) {
    return this.profile.listeningScore(userId, dto);
  }

  @Get('listening/latest')
  latestListening(@CurrentUser('id') userId: number) {
    return this.profile.latestListening(userId);
  }

  /** Bước 1 — tự đánh giá (không phải CEFR chứng nhận). */
  @Post('self-assessment')
  saveSelfAssessment(
    @CurrentUser('id') userId: number,
    @Body() dto: SelfAssessmentDto,
  ) {
    return this.profile.saveSelfAssessment(userId, dto.band);
  }

  /** Hồ sơ hợp nhất: self-assessment + quiz + writing + listening. */
  @Get('profile')
  getProfile(@CurrentUser('id') userId: number) {
    return this.profile.getProfile(userId);
  }

  @Get('roadmap')
  currentRoadmap(@CurrentUser('id') userId: number) {
    return this.roadmaps.current(userId);
  }

  @Post('roadmap/generate')
  generateRoadmap(@CurrentUser('id') userId: number) {
    return this.roadmaps.generate(userId);
  }

  @Post('roadmap/reassess')
  reassessRoadmap(@CurrentUser('id') userId: number) {
    return this.roadmaps.reassess(userId);
  }
}

function parseSeed(seed: string | undefined): number | undefined {
  if (seed == null || seed === '') return undefined;
  const value = Number(seed);
  if (!Number.isInteger(value) || value < 0 || value > MAX_FORM_SEED) {
    throw new AppException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST);
  }
  return value;
}
