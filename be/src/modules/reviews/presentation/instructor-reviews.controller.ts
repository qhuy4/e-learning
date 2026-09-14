import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';

@UseGuards(JwtAuthGuard)
@Controller('instructor/courses')
export class InstructorReviewsController {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  @Get(':courseId/reviews')
  async findAll(
    @Param('courseId') courseId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewRepository.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      courseId,
    });
  }
}
