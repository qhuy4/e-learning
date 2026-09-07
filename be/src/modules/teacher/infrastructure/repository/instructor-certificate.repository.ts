import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { InstructorCertificateEntity } from '@/modules/teacher/infrastructure/entity/instructor-certificate.entity';

@Injectable()
export class InstructorCertificateRepository {
  constructor(
    @InjectRepository(InstructorCertificateEntity)
    private readonly repository: Repository<InstructorCertificateEntity>,
  ) {}

  async findByUserId(userId: number): Promise<InstructorCertificateEntity[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  createMany(
    data: Partial<InstructorCertificateEntity>[],
    manager?: EntityManager,
  ): Promise<InstructorCertificateEntity[]> {
    const repo = manager
      ? manager.getRepository(InstructorCertificateEntity)
      : this.repository;
    const entities = repo.create(data);
    return repo.save(entities);
  }
}
