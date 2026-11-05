import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorAvailabilityRecurringOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-availability-recurring.orm.entity';

export interface CreateRecurringDto {
  instructor_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  effective_from: string;
  effective_until?: string | null;
  is_active?: boolean;
}

export interface UpdateRecurringDto {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  effective_from?: string;
  effective_until?: string | null;
  is_active?: boolean;
}

@Injectable()
export class InstructorAvailabilityRecurringRepository {
  constructor(
    @InjectRepository(InstructorAvailabilityRecurringOrmEntity)
    private readonly repo: Repository<InstructorAvailabilityRecurringOrmEntity>,
  ) {}

  async findByInstructor(instructorId: number) {
    return this.repo.find({
      where: { instructor_id: instructorId },
      order: { day_of_week: 'ASC', start_time: 'ASC' },
    });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async findOverlap(
    instructorId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ): Promise<InstructorAvailabilityRecurringOrmEntity | null> {
    const qb = this.repo
      .createQueryBuilder('a')
      .where('a.instructor_id = :instructorId', { instructorId })
      .andWhere('a.day_of_week = :dayOfWeek', { dayOfWeek })
      .andWhere('a.deleted_at IS NULL')
      .andWhere('a.start_time < :endTime', { endTime })
      .andWhere('a.end_time > :startTime', { startTime });

    if (excludeId) {
      qb.andWhere('a.id != :excludeId', { excludeId });
    }

    return qb.getOne();
  }

  async create(data: CreateRecurringDto) {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: number, data: UpdateRecurringDto) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: number) {
    await this.repo.softDelete(id);
  }
}
