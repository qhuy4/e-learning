import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorSkillOrmEntity } from '@/modules/skill-profiling/infrastructure/entity/instructor-skill.orm-entity';
import { InstructorSkillProfileOrmEntity } from '@/modules/skill-profiling/infrastructure/entity/instructor-skill-profile.orm-entity';
import { InstructorSkillEvidenceOrmEntity } from '@/modules/skill-profiling/infrastructure/entity/instructor-skill-evidence.orm-entity';
import { SkillCatalogRepository } from '@/modules/skill-profiling/infrastructure/repository/skill-catalog.repository';
import { SkillProfileRepository } from '@/modules/skill-profiling/infrastructure/repository/skill-profile.repository';
import { SkillSourceValidator } from '@/modules/skill-profiling/infrastructure/service/skill-source-validator';
import { SkillAggregationService } from '@/modules/skill-profiling/application/skill-aggregation.service';
import { SkillRefreshCronService } from '@/modules/skill-profiling/application/skill-refresh-cron.service';
import { SkillEvidenceService } from '@/modules/skill-profiling/application/skill-evidence.service';
import { SkillExtractorService } from '@/modules/skill-profiling/application/extractors/skill-extractor.service';
import { SkillFeatureExtractorService } from '@/modules/skill-profiling/application/extractors/skill-feature-extractor.service';
import { SkillProfileQueryService } from '@/modules/skill-profiling/application/skill-profile-query.service';
import { SkillRecommendationService } from '@/modules/skill-profiling/application/skill-recommendation.service';
import { SkillMatchingService } from '@/modules/skill-profiling/application/skill-matching.service';
import { SkillAssessmentRunService } from '@/modules/skill-profiling/application/skill-assessment-run.service';
import { InstructorSkillProfileController } from '@/modules/skill-profiling/presentation/instructor-skill-profile.controller';
import { InstructorSkillEvidenceController } from '@/modules/skill-profiling/presentation/instructor-skill-evidence.controller';
import { SkillMatchingController } from '@/modules/skill-profiling/presentation/skill-matching.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstructorSkillOrmEntity,
      InstructorSkillProfileOrmEntity,
      InstructorSkillEvidenceOrmEntity,
    ]),
  ],
  controllers: [
    InstructorSkillProfileController,
    InstructorSkillEvidenceController,
    SkillMatchingController,
  ],
  providers: [
    SkillCatalogRepository,
    SkillProfileRepository,
    SkillSourceValidator,
    SkillAggregationService,
    SkillRefreshCronService,
    SkillEvidenceService,
    SkillExtractorService,
    SkillFeatureExtractorService,
    SkillProfileQueryService,
    SkillRecommendationService,
    SkillMatchingService,
    SkillAssessmentRunService,
  ],
  exports: [
    SkillCatalogRepository,
    SkillProfileRepository,
    SkillAggregationService,
    SkillEvidenceService,
    SkillExtractorService,
    SkillFeatureExtractorService,
    SkillProfileQueryService,
    SkillRecommendationService,
    SkillMatchingService,
    SkillAssessmentRunService,
  ],
})
export class SkillProfilingModule {}
