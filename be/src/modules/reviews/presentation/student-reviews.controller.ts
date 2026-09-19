import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';

import { CreateReviewCommand } from '@/modules/reviews/application/command/create-review.command';
import { DeleteReviewCommand } from '@/modules/reviews/application/command/delete-review.command';
import { GetCourseReviewsQuery } from '@/modules/reviews/application/query/get-course-reviews.query';
import { CheckReviewEligibilityQuery } from '@/modules/reviews/application/query/check-review-eligibility.query';
import { ReviewDtoMapper } from '@/modules/reviews/presentation/mappers/review-dto.mapper';

export class CreateReviewDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  existingImageUrls?: string | string[];
}

@Controller('reviews')
export class StudentReviewsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStorage,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('course/:courseId/eligibility')
  async checkEligibility(
    @CurrentUser('id') userId: number,
    @Param('courseId') courseId: string,
  ) {
    return this.queryBus.execute(
      new CheckReviewEligibilityQuery(String(userId), courseId),
    );
  }

  /**
   * 1 SINGLE CONSOLIDATED API: Creates or updates review AND uploads attached image files in 1 request!
   */
  @UseGuards(JwtAuthGuard)
  @Post('course/:courseId')
  @UseInterceptors(FilesInterceptor('images', 5))
  async createOrUpdateReview(
    @CurrentUser('id') userId: number,
    @Param('courseId') courseId: string,
    @Body() dto: CreateReviewDto,
    @Req() req: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Robust rating extraction (from dto or req.body in case of multipart form data)
    const rawRating = dto.rating ?? req?.body?.rating;
    const parsedRating = Number(rawRating);

    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      throw new BadRequestException('Số sao đánh giá phải từ 1 đến 5');
    }

    const imageUrls: string[] = [];

    // Parse existing image URLs if provided (for review editing)
    const rawExisting = dto.existingImageUrls ?? req?.body?.existingImageUrls;
    if (rawExisting) {
      if (Array.isArray(rawExisting)) {
        imageUrls.push(...rawExisting);
      } else {
        imageUrls.push(rawExisting);
      }
    }

    // Upload newly attached image files directly to Cloud R2 Storage
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

    const commentText = dto.comment ?? req?.body?.comment ?? undefined;

    const result = await this.commandBus.execute(
      new CreateReviewCommand(
        String(userId),
        courseId,
        parsedRating,
        commentText,
        imageUrls,
      ),
    );

    return ReviewDtoMapper.toDto(result);
  }

  @Get('course/:courseId')
  async getCourseReviews(
    @Param('courseId') courseId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('rating') rating?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('hasImage') hasImage?: string,
  ) {
    return this.queryBus.execute(
      new GetCourseReviewsQuery(
        courseId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10,
        rating ? Number(rating) : undefined,
        sortOrder ?? 'desc',
        hasImage === 'true' || hasImage === '1',
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteReview(
    @CurrentUser('id') userId: number,
    @Param('id') id: string,
  ) {
    return this.commandBus.execute(
      new DeleteReviewCommand(id, String(userId)),
    );
  }
}
