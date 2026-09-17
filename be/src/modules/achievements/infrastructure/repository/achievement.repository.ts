import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { AchievementOrmEntity } from '@/modules/achievements/infrastructure/entity/achievement.orm-entity';

@Injectable()
export class AchievementRepository {
  constructor(
    @InjectRepository(AchievementOrmEntity)
    private readonly repository: Repository<AchievementOrmEntity>,
  ) {}

  async findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: string;
    criteria?: string;
    isActive?: boolean;
  }) {
    const { page, limit, keyword, sortBy, sortOrder, criteria, isActive } = options;

    const query = this.repository.createQueryBuilder('a');

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('a.name ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('a.description ILIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    if (criteria) {
      query.andWhere('a.criteria = :criteria', { criteria });
    }

    if (isActive !== undefined) {
      query.andWhere('a.is_active = :isActive', { isActive });
    }

    const sortableColumns: Record<string, string> = {
      createdAt: 'a.created_at',
      updatedAt: 'a.updated_at',
      name: 'a.name',
      threshold: 'a.threshold',
    };

    const sortKey = sortBy && sortableColumns[sortBy] ? sortableColumns[sortBy] : 'a.updated_at';
    const sortDirection: 'ASC' | 'DESC' = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(sortKey, sortDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    const data = entities.map((e) => ({
      id: Number(e.id),
      name: e.name,
      description: e.description,
      icon: e.icon,
      criteria: e.criteria,
      threshold: e.threshold,
      reward: e.reward,
      isActive: e.isActive,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    if (!entity) return null;

    const earnedCount = await this.repository.manager
      .createQueryBuilder()
      .from('user_achievements', 'ua')
      .where('ua.achievement_id = :id', { id: id.toString() })
      .getCount();

    return {
      id: Number(entity.id),
      name: entity.name,
      description: entity.description,
      icon: entity.icon,
      criteria: entity.criteria,
      threshold: entity.threshold,
      reward: entity.reward,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      earnedCount,
    };
  }

  async create(data: Partial<AchievementOrmEntity>) {
    const entity = this.repository.create(data);
    const saved = await this.repository.save(entity);
    return {
      id: Number(saved.id),
      name: saved.name,
      description: saved.description,
      icon: saved.icon,
      criteria: saved.criteria,
      threshold: saved.threshold,
      reward: saved.reward,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async update(id: number, data: {
    name?: string;
    description?: string;
    icon?: string | null;
    criteria?: string;
    threshold?: number;
    reward?: Record<string, unknown> | null;
    isActive?: boolean;
  }) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.reward === null) {
      updateData.reward = null;
    }
    await this.repository.update(id.toString(), updateData as any);
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return {
      id: Number(entity!.id),
      name: entity!.name,
      description: entity!.description,
      icon: entity!.icon,
      criteria: entity!.criteria,
      threshold: entity!.threshold,
      reward: entity!.reward,
      isActive: entity!.isActive,
      createdAt: entity!.createdAt,
      updatedAt: entity!.updatedAt,
    };
  }

  async delete(id: number) {
    await this.repository.delete(id.toString());
  }

  async findByName(name: string) {
    const entity = await this.repository.findOne({ where: { name } });
    if (!entity) return null;
    return {
      id: Number(entity.id),
      name: entity.name,
      description: entity.description,
      icon: entity.icon,
      criteria: entity.criteria,
      threshold: entity.threshold,
      reward: entity.reward,
      isActive: entity.isActive,
    };
  }
}
