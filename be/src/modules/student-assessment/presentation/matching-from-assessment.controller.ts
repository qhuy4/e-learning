import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { StudentAssessmentService } from '@/modules/student-assessment/application/student-assessment.service';
import { LearnerProfileService } from '@/modules/student-assessment/application/learner-profile.service';
import { MatchFromAssessmentDto } from '@/modules/student-assessment/presentation/dto/match-from-assessment.dto';
import { MatchFromProfileDto } from '@/modules/student-assessment/presentation/dto/match-from-profile.dto';

/**
 * Matching từ assessment: dùng focus targets + CEFR band đã lưu để xếp hạng
 * giảng viên (fit = mức đáp ứng nhu cầu, level = filter/tie-break).
 */
@Controller('matching')
@UseGuards(JwtAuthGuard)
export class MatchingFromAssessmentController {
  constructor(
    private readonly assessments: StudentAssessmentService,
    private readonly profile: LearnerProfileService,
  ) {}

  @Post('from-assessment')
  match(
    @CurrentUser('id') userId: number,
    @Body() dto: MatchFromAssessmentDto,
  ) {
    return this.assessments.matchFromAssessment(userId, dto);
  }

  /** Matching từ hồ sơ hợp nhất (quiz +/hoặc writing) — không cần assessmentId. */
  @Post('from-profile')
  matchFromProfile(
    @CurrentUser('id') userId: number,
    @Body() dto: MatchFromProfileDto,
  ) {
    return this.profile.matchFromProfile(userId, dto);
  }
}
