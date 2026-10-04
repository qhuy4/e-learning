import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { InstructorKycEntity } from '@/modules/teacher/infrastructure/entity/instructor-kyc.entity';

@Injectable()
export class InstructorKycRepository {
  constructor(
    @InjectRepository(InstructorKycEntity)
    private readonly repository: Repository<InstructorKycEntity>,
  ) {}

  async findLatestByUserId(
    userId: number,
  ): Promise<InstructorKycEntity | null> {
    return this.repository.findOne({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  create(
    data: Partial<InstructorKycEntity>,
    manager?: EntityManager,
  ): Promise<InstructorKycEntity> {
    const repo = manager
      ? manager.getRepository(InstructorKycEntity)
      : this.repository;
    const entity = repo.create(data);
    return repo.save(entity);
  }
}
