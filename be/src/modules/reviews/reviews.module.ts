import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { StorageModule } from '@/common/storage/storage.module';
import { EnrollmentsModule } from '@/modules/enrollments/enrollments.module';
import { SkillProfilingModule } from '@/modules/skill-profiling/skill-profiling.module';

import { ReviewOrmEntity } from '@/modules/reviews/infrastructure/entity/review.orm-entity';
import { ReviewImageOrmEntity } from '@/modules/reviews/infrastructure/entity/review-image.orm-entity';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';

import { ReviewsController } from '@/modules/reviews/presentation/reviews.controller';
import { InstructorReviewsController } from '@/modules/reviews/presentation/instructor-reviews.controller';
import { StudentReviewsController } from '@/modules/reviews/presentation/student-reviews.controller';

import { GetReviewsHandler } from '@/modules/reviews/application/query-handler/get-reviews.handler';
import { GetReviewByIdHandler } from '@/modules/reviews/application/query-handler/get-review-by-id.handler';
import { GetCourseReviewsHandler } from '@/modules/reviews/application/query-handler/get-course-reviews.handler';
import { CheckReviewEligibilityHandler } from '@/modules/reviews/application/query-handler/check-review-eligibility.handler';

import { UpdateReviewStatusHandler } from '@/modules/reviews/application/command-handler/update-review-status.handler';
import { CreateReviewHandler } from '@/modules/reviews/application/command-handler/create-review.handler';
import { DeleteReviewHandler } from '@/modules/reviews/application/command-handler/delete-review.handler';

const QueryHandlers = [
  GetReviewsHandler,
  GetReviewByIdHandler,
  GetCourseReviewsHandler,
  CheckReviewEligibilityHandler,
];

const CommandHandlers = [
  UpdateReviewStatusHandler,
  CreateReviewHandler,
  DeleteReviewHandler,
];

@Module({
  imports: [
    CqrsModule,
    StorageModule,
    EnrollmentsModule,
    SkillProfilingModule,
    TypeOrmModule.forFeature([ReviewOrmEntity, ReviewImageOrmEntity]),
  ],
  controllers: [
    ReviewsController,
    InstructorReviewsController,
    StudentReviewsController,
  ],
  providers: [ReviewRepository, ...QueryHandlers, ...CommandHandlers],
  exports: [ReviewRepository],
})
export class ReviewsModule {}
