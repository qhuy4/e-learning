import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SkillProfilingModule } from '@/modules/skill-profiling/skill-profiling.module';
import { ModelClientService } from '@/modules/student-assessment/infrastructure/model-client.service';
import { StudentAssessmentService } from '@/modules/student-assessment/application/student-assessment.service';
import { LearnerProfileService } from '@/modules/student-assessment/application/learner-profile.service';
import { StudentAssessmentController } from '@/modules/student-assessment/presentation/student-assessment.controller';
import { MatchingFromAssessmentController } from '@/modules/student-assessment/presentation/matching-from-assessment.controller';
import { LearnerProfileController } from '@/modules/student-assessment/presentation/learner-profile.controller';

@Module({
  imports: [HttpModule.register({ timeout: 20000 }), SkillProfilingModule],
  controllers: [
    StudentAssessmentController,
    MatchingFromAssessmentController,
    LearnerProfileController,
  ],
  providers: [
    ModelClientService,
    StudentAssessmentService,
    LearnerProfileService,
  ],
  exports: [StudentAssessmentService, LearnerProfileService],
})
export class StudentAssessmentModule {}
