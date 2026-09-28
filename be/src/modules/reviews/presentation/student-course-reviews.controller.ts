import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { extname } from 'path';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';

import { CreateReviewCommand } from '@/modules/reviews/application/command/create-review.command';
import { GetCourseReviewsQuery } from '@/modules/reviews/application/query/get-course-reviews.query';
import { CheckReviewEligibilityQuery } from '@/modules/reviews/application/query/check-review-eligibility.query';

export class CreateReviewDto {
  rating: number;
  comment?: string;
  existingImageUrls?: string | string[];
}

@Controller('courses')
export class StudentCourseReviewsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStorage,
  ) {}

  @Get(':courseId/reviews')
  async getCourseReviews(
    @Param('courseId') courseId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('rating') rating?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.queryBus.execute(
      new GetCourseReviewsQuery(
        courseId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10,
        rating ? Number(rating) : undefined,
        sortOrder ?? 'desc',
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':courseId/reviews/eligibility')
  async checkEligibility(
    @CurrentUser('id') userId: number,
    @Param('courseId') courseId: string,
  ) {
    return this.queryBus.execute(
      new CheckReviewEligibilityQuery(String(userId), courseId),
    );
  }

  /**
   * Consolidated single API endpoint for review creation & file uploads under /courses/:courseId/reviews
   */
  @UseGuards(JwtAuthGuard)
  @Post(':courseId/reviews')
  @UseInterceptors(FilesInterceptor('images', 5))
  async createOrUpdateReview(
    @CurrentUser('id') userId: number,
    @Param('courseId') courseId: string,
    @Body() dto: CreateReviewDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const imageUrls: string[] = [];

    if (dto.existingImageUrls) {
      if (Array.isArray(dto.existingImageUrls)) {
        imageUrls.push(...dto.existingImageUrls);
      } else {
        imageUrls.push(dto.existingImageUrls);
      }
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const ext = extname(file.originalname).toLowerCase() || '.png';
        const key = `reviews/${userId}/${Date.now()}-${randomUUID()}${ext}`;

        await this.fileStorage.upload({
          key,
          body: file.buffer,
          contentType: file.mimetype,
        });

        const publicUrl = this.fileStorage.getPublicUrl(key);
        if (publicUrl) {
          imageUrls.push(publicUrl);
        }
      }
    }

    return this.commandBus.execute(
      new CreateReviewCommand(
        String(userId),
        courseId,
        Number(dto.rating),
        dto.comment,
        imageUrls,
      ),
    );
  }
}
