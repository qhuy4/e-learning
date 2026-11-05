import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorSkillProfileOrmEntity } from '@/modules/skill-profiling/infrastructure/entity/instructor-skill-profile.orm-entity';

@Injectable()
export class SkillProfileRepository {
  constructor(
    @InjectRepository(InstructorSkillProfileOrmEntity)
    private readonly repo: Repository<InstructorSkillProfileOrmEntity>,
  ) {}

  /**
   * Top N instructors for a skill with confidence >= minConfidence.
   * Skills without a profile row are "unknown" (absent), never 0.
   */
  async findTopBySkill(
    skillId: number,
    minConfidence: number,
    limit: number,
  ): Promise<InstructorSkillProfileOrmEntity[]> {
    return this.repo
      .createQueryBuilder('p')
      .where('p.skill_id = :skillId', { skillId })
      .andWhere('p.confidence >= :minConfidence', { minConfidence })
      .orderBy('p.score', 'DESC')
      .addOrderBy('p.confidence', 'DESC')
      .take(limit)
      .getMany();
  }

  async findByInstructor(
    instructorId: number,
  ): Promise<InstructorSkillProfileOrmEntity[]> {
    return this.repo.find({ where: { instructor_id: instructorId } });
  }
}
