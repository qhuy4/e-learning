import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { InstructorProfileEntity } from '../entity/instructor-profile.entity';

@Injectable()
export class InstructorProfileRepository {
  constructor(
    @InjectRepository(InstructorProfileEntity)
    private readonly repository: Repository<InstructorProfileEntity>,
  ) {}

  async findByUserId(
    userId: number,
  ): Promise<InstructorProfileEntity | null> {
    return this.repository.findOne({ where: { userId } });
  }

  /**
   * @param manager Truyền vào khi cần chạy trong 1 transaction (VD: đăng ký
   * giáo viên phải ghi đồng thời instructor_profiles + instructor_kyc +
   * instructor_certificates, tất cả hoặc không có gì).
   */
  create(
    data: Partial<InstructorProfileEntity>,
    manager?: EntityManager,
  ): Promise<InstructorProfileEntity> {
    const repo = manager
      ? manager.getRepository(InstructorProfileEntity)
      : this.repository;
    const entity = repo.create(data);
    return repo.save(entity);
  }
}
