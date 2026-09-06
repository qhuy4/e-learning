import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewOrmEntity } from '@/modules/reviews/domain/entity/review.orm-entity';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';
import { ReviewsController } from '@/modules/reviews/presentation/reviews.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewOrmEntity])],
  controllers: [ReviewsController],
  providers: [ReviewRepository],
  exports: [ReviewRepository],
})
export class ReviewsModule {}
