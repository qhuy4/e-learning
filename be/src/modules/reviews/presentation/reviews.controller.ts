import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { PaginationDto } from '@/common/pagination/pagination.dto';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';

@Controller('admin/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewRepository: ReviewRepository,
  ) {}

  @Get()
  findAll(
    @Query() query: PaginationDto,
    @Query('keyword') keyword?: string,
    @Query('courseId') courseId?: number,
    @Query('userId') userId?: number,
    @Query('status') status?: number,
  ) {
    return this.reviewRepository.findAll({
      page: query.page,
      limit: query.limit,
      keyword,
      courseId,
      userId,
      status,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewRepository.findById(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Query('status') status: number) {
    return this.reviewRepository.updateStatus(id, status);
  }
}
