import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { SkillProfileQueryService } from '@/modules/skill-profiling/application/skill-profile-query.service';
import { SkillRecommendationService } from '@/modules/skill-profiling/application/skill-recommendation.service';
import { SkillAssessmentRunService } from '@/modules/skill-profiling/application/skill-assessment-run.service';

@Controller('instructor/skill-profile')
@UseGuards(JwtAuthGuard)
export class InstructorSkillProfileController {
  constructor(
    private readonly queryService: SkillProfileQueryService,
    private readonly assessmentRuns: SkillAssessmentRunService,
    private readonly recommendationService: SkillRecommendationService,
  ) {}

  /** Route tĩnh khai báo trước :skillId để không bị nuốt bởi param. */
  @Get('recommendations')
  async recommendations(@CurrentUser('id') userId: number) {
    const profileId = await this.queryService.resolveProfileId(userId);
    return this.recommendationService.get(profileId);
  }

  @Patch('recommendations/:id/dismiss')
  async dismissRecommendation(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const profileId = await this.queryService.resolveProfileId(userId);
    if (!(await this.recommendationService.dismiss(profileId, id))) {
      throw new NotFoundException('Recommendation not found');
    }
    return { dismissed: true };
  }

  /** Extractor chạy 5 nguồn từ DB thật + feature store rồi recompute profile. */
  @Post('refresh')
  async refresh(@CurrentUser('id') userId: number) {
    const profileId = await this.queryService.resolveProfileId(userId);
    const run = await this.assessmentRuns.execute(profileId, 'MANUAL');
    const skills = await this.queryService.list(profileId);
    return { ...run, skills };
  }

  @Get()
  async list(@CurrentUser('id') userId: number) {
    const profileId = await this.queryService.resolveProfileId(userId);
    return this.queryService.list(profileId);
  }

  @Get(':skillId/history')
  async history(
    @CurrentUser('id') userId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
  ) {
    const profileId = await this.queryService.resolveProfileId(userId);
    return this.queryService.history(profileId, skillId);
  }

  @Get(':skillId')
  async detail(
    @CurrentUser('id') userId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
  ) {
    const profileId = await this.queryService.resolveProfileId(userId);
    return this.queryService.detail(profileId, skillId);
  }
}
