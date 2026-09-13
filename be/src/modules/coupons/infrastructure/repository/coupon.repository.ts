import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CouponOrmEntity } from '@/modules/coupons/infrastructure/entity/coupon.orm-entity';
import { CouponCourseOrmEntity } from '@/modules/coupons/infrastructure/entity/coupon-course.orm-entity';
import { ICouponRepository } from '@/modules/coupons/domain/repository/coupon.repository';
import { CouponMapper } from '@/modules/coupons/infrastructure/mapper/coupon.mapper';

@Injectable()
export class CouponRepository implements ICouponRepository {
  constructor(
    @InjectRepository(CouponOrmEntity)
    private readonly repository: Repository<CouponOrmEntity>,
    @InjectRepository(CouponCourseOrmEntity)
    private readonly couponCourseRepository: Repository<CouponCourseOrmEntity>,
  ) {}

  async findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    scope?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, keyword, scope, isActive, sortBy, sortOrder } = options;

    const query = this.repository
      .createQueryBuilder('coupon')
      .leftJoinAndSelect('coupon.couponCourses', 'cc')
      .leftJoinAndSelect('cc.course', 'course')
      .leftJoinAndSelect('coupon.creator', 'creator');

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('coupon.code ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('coupon.description ILIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    if (scope !== undefined) {
      query.andWhere('coupon.scope = :scope', { scope });
    }

    if (isActive !== undefined) {
      query.andWhere('coupon.is_active = :isActive', { isActive });
    }

    const sortableColumns: Record<string, string> = {
      code: 'coupon.code',
      discountValue: 'coupon.discount_value',
      usedCount: 'coupon.used_count',
      createdAt: 'coupon.created_at',
      validUntil: 'coupon.valid_until',
    };

    const sortKey = sortBy && sortableColumns[sortBy] ? sortableColumns[sortBy] : 'coupon.created_at';
    const sortDirection: 'ASC' | 'DESC' = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(sortKey, sortDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    const data = entities.map((entity) => CouponMapper.toDomain(entity));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
      relations: { couponCourses: { course: true }, creator: true },
    });
    if (!entity) return null;
    return CouponMapper.toDomain(entity);
  }

  async findByCode(code: string) {
    const entity = await this.repository.findOne({
      where: { code },
      relations: { couponCourses: { course: true }, creator: true },
    });
    if (!entity) return null;
    return CouponMapper.toDomain(entity);
  }

  async create(data: Partial<CouponOrmEntity> & { courseIds?: number[] }) {
    const { courseIds, ...couponData } = data;
    const entity = this.repository.create(couponData);
    const saved = await this.repository.save(entity);

    if (courseIds && courseIds.length > 0) {
      const couponCourses = courseIds.map((courseId) =>
        this.couponCourseRepository.create({ couponId: saved.id, courseId: courseId.toString() }),
      );
      await this.couponCourseRepository.save(couponCourses);
    }

    return this.findById(Number(saved.id));
  }

  async update(id: number, data: Partial<CouponOrmEntity> & { courseIds?: number[] }) {
    const { courseIds, ...couponData } = data;
    await this.repository.update(id.toString(), couponData);

    if (courseIds !== undefined) {
      await this.couponCourseRepository.delete({ couponId: id.toString() });
      if (courseIds.length > 0) {
        const couponCourses = courseIds.map((courseId) =>
          this.couponCourseRepository.create({ couponId: id.toString(), courseId: courseId.toString() }),
        );
        await this.couponCourseRepository.save(couponCourses);
      }
    }

    return this.findById(id);
  }

  async softDelete(id: number) {
    await this.repository.delete(id.toString());
  }

  async toggleActive(id: number) {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    if (!entity) return null;
    entity.isActive = !entity.isActive;
    await this.repository.save(entity);
    return this.findById(id);
  }

  async syncCourses(id: number, courseIds: number[]) {
    await this.couponCourseRepository.delete({ couponId: id.toString() });
    if (courseIds.length > 0) {
      const couponCourses = courseIds.map((courseId) =>
        this.couponCourseRepository.create({ couponId: id.toString(), courseId: courseId.toString() }),
      );
      await this.couponCourseRepository.save(couponCourses);
    }
  }
}
