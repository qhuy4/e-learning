import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorSkillOrmEntity } from '@/modules/skill-profiling/infrastructure/entity/instructor-skill.orm-entity';

@Injectable()
export class SkillCatalogRepository {
  constructor(
    @InjectRepository(InstructorSkillOrmEntity)
    private readonly repo: Repository<InstructorSkillOrmEntity>,
  ) {}

  findAll(): Promise<InstructorSkillOrmEntity[]> {
    return this.repo.find({ order: { display_order: 'ASC' } });
  }

  findActiveById(id: number): Promise<InstructorSkillOrmEntity | null> {
    return this.repo.findOne({ where: { id, is_active: true } });
  }

  findByCode(code: string): Promise<InstructorSkillOrmEntity | null> {
    return this.repo.findOne({ where: { code } });
  }
}
