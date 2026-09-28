import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { ReviewOrmEntity } from '@/modules/reviews/infrastructure/entity/review.orm-entity';
import { ReviewImageOrmEntity } from '@/modules/reviews/infrastructure/entity/review-image.orm-entity';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';

export interface FindReviewsOptions {
  page: number;
  limit: number;
  keyword?: string;
  courseId?: string;
  userId?: string;
  status?: number;
  rating?: number;
  hasImage?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateReviewData {
  userId: string;
  courseId: string;
  rating: number;
  comment?: string | null;
  imageUrls?: string[];
}

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectRepository(ReviewOrmEntity)
    private readonly repository: Repository<ReviewOrmEntity>,
    @InjectRepository(ReviewImageOrmEntity)
    private readonly imageRepository: Repository<ReviewImageOrmEntity>,
  ) {}

  async resolveCourseId(courseIdInput: string): Promise<string> {
    if (!courseIdInput) return courseIdInput;
    const trimmed = String(courseIdInput).trim();
    if (/^\d+$/.test(trimmed)) {
      return trimmed;
    }

    try {
      const course = await this.repository.manager
        .getRepository(CourseOrmEntity)
        .findOne({
          where: { slug: trimmed },
          select: { id: true },
        });
      return course ? String(course.id) : trimmed;
    } catch {
      return trimmed;
    }
  }

  async findAll(options: FindReviewsOptions) {
    const { page, limit, courseId, userId, status, rating, sortBy, sortOrder } =
      options;

    const where: FindOptionsWhere<ReviewOrmEntity> = {};

    if (courseId) {
      where.courseId = await this.resolveCourseId(courseId);
    }

    if (userId) {
      where.userId = userId;
    }

    if (status !== undefined) {
      where.status = status;
    }

    if (rating !== undefined && rating > 0) {
      where.rating = rating;
    }

    const columnMap: Record<
      NonNullable<FindReviewsOptions['sortBy']>,
      keyof ReviewOrmEntity
    > = {
      rating: 'rating',
      createdAt: 'createdAt',
      status: 'status',
    };

    const sortKey = sortBy && columnMap[sortBy] ? columnMap[sortBy] : 'createdAt';
    const order: FindOptionsOrder<ReviewOrmEntity> = {
      [sortKey]: sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    };

    const [data, total] = await this.repository.findAndCount({
      where,
      order,
      relations: { user: true, course: true, images: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByCourseIdWithStats(options: FindReviewsOptions & { courseId: string }) {
    const { page, limit, courseId, rating, hasImage, sortOrder } = options;
    const targetCourseId = await this.resolveCourseId(courseId);

    const qb = this.repository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('review.images', 'images')
      .where('review.course_id = :courseId', { courseId: targetCourseId })
      .andWhere('(review.status = 1 OR review.status IS NULL)')
      .andWhere('review.deleted_at IS NULL');

    if (rating && rating >= 1 && rating <= 5) {
      qb.andWhere('review.rating = :rating', { rating });
    }

    if (hasImage) {
      qb.innerJoin('review.images', 'filter_img');
    }

    const orderDirection = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy('review.created_at', orderDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    // Calculate rating breakdown & statistics across all active reviews for this course
    const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRatings = 0;
    let sumRating = 0;

    try {
      const rawStats = await this.repository
        .createQueryBuilder('review')
        .select('review.rating', 'rating')
        .addSelect('COUNT(review.id)', 'count')
        .where('review.course_id = :courseId', { courseId: targetCourseId })
        .andWhere('(review.status = 1 OR review.status IS NULL)')
        .andWhere('review.deleted_at IS NULL')
        .groupBy('review.rating')
        .getRawMany();

      for (const stat of rawStats) {
        let r = NaN;
        let c = 0;
        for (const [key, val] of Object.entries(stat)) {
          if (key.toLowerCase().includes('rating')) r = Number(val);
          if (key.toLowerCase().includes('count') || key.toLowerCase().includes('cnt')) c = Number(val);
        }
        if (!isNaN(r) && r >= 1 && r <= 5) {
          starCounts[r] = c;
          totalRatings += c;
          sumRating += r * c;
        }
      }
    } catch {
      // Fallback if QueryBuilder raw stats fails
    }

    // Fallback if rawStats produced 0 ratings
    if (totalRatings === 0) {
      const allCourseReviews = await this.repository.find({
        where: {
          courseId: targetCourseId,
        },
      });

      for (const r of allCourseReviews) {
        if (r.deletedAt) continue;
        if (r.status !== undefined && r.status !== null && r.status !== 1) continue;

        const rate = Number(r.rating);
        if (!isNaN(rate) && rate >= 1 && rate <= 5) {
          starCounts[rate] = (starCounts[rate] || 0) + 1;
          totalRatings++;
          sumRating += rate;
        }
      }
    }

    const averageRating = totalRatings > 0 ? Number((sumRating / totalRatings).toFixed(1)) : 0;

    return {
      data,
      stats: {
        averageRating,
        totalReviews: totalRatings,
        starCounts,
      },
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return this.repository.findOne({
      where: { id },
      relations: { user: { profile: true }, course: true, images: true },
    });
  }

  async findByUserAndCourse(userId: string, courseId: string) {
    const targetCourseId = await this.resolveCourseId(courseId);
    return this.repository.findOne({
      where: { userId: String(userId), courseId: String(targetCourseId) },
      relations: { user: { profile: true }, course: true, images: true },
    });
  }

  async createOrUpdateReview(data: CreateReviewData) {
    const { userId, courseId, rating, comment, imageUrls } = data;
    const targetCourseId = await this.resolveCourseId(courseId);

    let review = await this.findByUserAndCourse(userId, targetCourseId);

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment ?? null;
      review.updatedAt = new Date();

      const savedReview = await this.repository.save(review);

      // Clear existing images and replace if imageUrls provided
      if (imageUrls !== undefined) {
        await this.imageRepository.delete({ reviewId: savedReview.id });
        if (imageUrls && imageUrls.length > 0) {
          const imageEntities = imageUrls.map((url) => {
            const img = new ReviewImageOrmEntity();
            img.reviewId = savedReview.id;
            img.imageUrl = url;
            img.createdAt = new Date();
            return img;
          });
          await this.imageRepository.save(imageEntities);
        }
      }

      return this.findById(savedReview.id);
    } else {
      // Create new review
      review = this.repository.create({
        userId: String(userId),
        courseId: String(targetCourseId),
        rating,
        comment: comment ?? null,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedReview = await this.repository.save(review);

      if (imageUrls && imageUrls.length > 0) {
        const imageEntities = imageUrls.map((url) => {
          return this.imageRepository.create({
            reviewId: savedReview.id,
            imageUrl: url,
            createdAt: new Date(),
          });
        });
        await this.imageRepository.save(imageEntities);
      }

      return this.findById(savedReview.id);
    }
  }

  async deleteReview(id: string, userId: string) {
    const review = await this.repository.findOne({ where: { id, userId } });
    if (!review) {
      return false;
    }
    await this.repository.delete(id);
    return true;
  }

  async updateStatus(id: string, status: number) {
    await this.repository.update(id, { status });
    return this.repository.findOne({
      where: { id },
      relations: { user: true, course: true, images: true },
    });
  }
}
