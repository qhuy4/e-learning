import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SkillProfilingModule } from '@/modules/skill-profiling/skill-profiling.module';
import { ModelClientService } from '@/modules/student-assessment/infrastructure/model-client.service';
import { StudentAssessmentService } from '@/modules/student-assessment/application/student-assessment.service';
import { LearnerProfileService } from '@/modules/student-assessment/application/learner-profile.service';
import { StudentAssessmentController } from '@/modules/student-assessment/presentation/student-assessment.controller';
import { MatchingFromAssessmentController } from '@/modules/student-assessment/presentation/matching-from-assessment.controller';
import { LearnerProfileController } from '@/modules/student-assessment/presentation/learner-profile.controller';
import { StorageModule } from '@/common/storage/storage.module';
import { SpeakingAssessmentService } from '@/modules/student-assessment/application/speaking-assessment.service';
import { CloudTranscriptionService } from '@/modules/student-assessment/infrastructure/cloud-transcription.service';
import { SpeakingAssessmentController } from '@/modules/student-assessment/presentation/speaking-assessment.controller';
import { CloudSpeakingEvaluationService } from '@/modules/student-assessment/infrastructure/cloud-speaking-evaluation.service';
import { CourseMatchingService } from '@/modules/student-assessment/application/course-matching.service';
import { RoadmapService } from '@/modules/student-assessment/application/roadmap.service';
import { SpeakingAssessmentWorker } from '@/modules/student-assessment/infrastructure/workers/speaking-assessment.worker';

@Module({
  imports: [
    HttpModule.register({ timeout: 20000 }),
    SkillProfilingModule,
    StorageModule,
  ],
  controllers: [
    StudentAssessmentController,
    MatchingFromAssessmentController,
    LearnerProfileController,
    SpeakingAssessmentController,
  ],
  providers: [
    ModelClientService,
    StudentAssessmentService,
    LearnerProfileService,
    SpeakingAssessmentService,
    CloudTranscriptionService,
    CloudSpeakingEvaluationService,
    CourseMatchingService,
    RoadmapService,
    SpeakingAssessmentWorker,
  ],
  exports: [StudentAssessmentService, LearnerProfileService],
})
export class StudentAssessmentModule {}
