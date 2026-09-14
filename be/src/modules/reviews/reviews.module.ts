import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ReviewOrmEntity } from '@/modules/reviews/infrastructure/entity/review.orm-entity';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';
import { ReviewsController } from '@/modules/reviews/presentation/reviews.controller';
import { InstructorReviewsController } from '@/modules/reviews/presentation/instructor-reviews.controller';
import { GetReviewsHandler } from '@/modules/reviews/application/query-handler/get-reviews.handler';
import { GetReviewByIdHandler } from '@/modules/reviews/application/query-handler/get-review-by-id.handler';
import { UpdateReviewStatusHandler } from '@/modules/reviews/application/command-handler/update-review-status.handler';

const QueryHandlers = [GetReviewsHandler, GetReviewByIdHandler];
const CommandHandlers = [UpdateReviewStatusHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([ReviewOrmEntity]),
  ],
  controllers: [ReviewsController, InstructorReviewsController],
  providers: [
    ReviewRepository,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [ReviewRepository],
})
export class ReviewsModule {}
