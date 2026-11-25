import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { StudentAssessmentService } from '@/modules/student-assessment/application/student-assessment.service';
import { LearnerProfileService } from '@/modules/student-assessment/application/learner-profile.service';
import { MatchFromAssessmentDto } from '@/modules/student-assessment/presentation/dto/match-from-assessment.dto';
import { MatchFromProfileDto } from '@/modules/student-assessment/presentation/dto/match-from-profile.dto';
import { CourseMatchingService } from '@/modules/student-assessment/application/course-matching.service';

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
    private readonly courseMatching: CourseMatchingService,
  ) {}

  @Post('from-assessment')
  match(
    @CurrentUser('id') userId: number,
    @Body() dto: MatchFromAssessmentDto,
  ) {
    return this.assessments.matchFromAssessment(userId, dto);
  }

  /** Matching từ quiz bắt buộc + 1–3 mục tiêu do học viên chọn. */
  @Post('from-profile')
  matchFromProfile(
    @CurrentUser('id') userId: number,
    @Body() dto: MatchFromProfileDto,
  ) {
    return this.profile.matchFromProfile(userId, dto);
  }

  @Post('courses')
  matchCourses(@CurrentUser('id') userId: number) {
    return this.courseMatching.match(userId);
  }
}
