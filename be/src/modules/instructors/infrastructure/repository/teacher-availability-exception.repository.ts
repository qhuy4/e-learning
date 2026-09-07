import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherAvailabilityExceptionOrmEntity } from '@/modules/instructors/infrastructure/entity/teacher-availability-exception.orm.entity';

export interface CreateExceptionDto {
  instructor_id: number;
  specific_date: string;
  is_unavailable: boolean;
  start_time?: string | null;
  end_time?: string | null;
  reason?: string | null;
}

export interface UpdateExceptionDto {
  specific_date?: string;
  is_unavailable?: boolean;
  start_time?: string | null;
  end_time?: string | null;
  reason?: string | null;
}

@Injectable()
export class TeacherAvailabilityExceptionRepository {
  constructor(
    @InjectRepository(TeacherAvailabilityExceptionOrmEntity)
    private readonly repo: Repository<TeacherAvailabilityExceptionOrmEntity>,
  ) {}

  async findByInstructor(instructorId: number) {
    return this.repo.find({
      where: { instructor_id: instructorId },
      order: { specific_date: 'ASC' },
    });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async findByDate(
    instructorId: number,
    specificDate: string,
    excludeId?: number,
  ): Promise<TeacherAvailabilityExceptionOrmEntity | null> {
    const qb = this.repo
      .createQueryBuilder('a')
      .where('a.instructor_id = :instructorId', { instructorId })
      .andWhere('a.specific_date = :specificDate', { specificDate })
      .andWhere('a.deleted_at IS NULL');

    if (excludeId) {
      qb.andWhere('a.id != :excludeId', { excludeId });
    }

    return qb.getOne();
  }

  async create(data: CreateExceptionDto) {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: number, data: UpdateExceptionDto) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: number) {
    await this.repo.softDelete(id);
  }
}
