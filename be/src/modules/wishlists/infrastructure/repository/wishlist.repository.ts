import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { WishlistOrmEntity, WishlistItemOrmEntity } from '@/modules/wishlists/infrastructure/entity/wishlist.orm-entity';

@Injectable()
export class WishlistRepository {
  constructor(
    @InjectRepository(WishlistOrmEntity)
    private readonly repo: Repository<WishlistOrmEntity>,
    @InjectRepository(WishlistItemOrmEntity)
    private readonly itemRepo: Repository<WishlistItemOrmEntity>,
  ) {}

  async findAll(options: { page: number; limit: number; keyword?: string }) {
    const { page, limit, keyword } = options;

    const qb = this.repo
      .createQueryBuilder('w')
      .leftJoinAndSelect('w.user', 'user');

    if (keyword) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('w.name ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('user.name ILIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    qb.orderBy('w.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();

    // Batch count items
    const ids = entities.map((e) => e.id);
    const countResults = ids.length > 0
      ? await this.itemRepo
          .createQueryBuilder('wi')
          .select('wi.wishlist_id', 'wid')
          .addSelect('COUNT(*)', 'cnt')
          .where('wi.wishlist_id IN (:...ids)', { ids })
          .groupBy('wi.wishlist_id')
          .getRawMany()
      : [];
    const countMap = new Map<string, number>(countResults.map((r: any) => [String(r.wid), Number(r.cnt)]));

    const data = entities.map((e) => ({
      id: Number(e.id),
      userId: Number(e.userId),
      name: e.name,
      isDefault: e.isDefault,
      createdAt: e.createdAt,
      user: e.user ? { id: Number(e.user.id), name: e.user.name } : undefined,
      itemCount: countMap.get(String(e.id)) ?? 0,
    }));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const entity = await this.repo.findOne({
      where: { id: id.toString() },
      relations: { user: true },
    });
    if (!entity) return null;

    const items = await this.itemRepo.find({
      where: { wishlistId: id.toString() },
      relations: { course: true },
      order: { addedAt: 'DESC' },
    });

    return {
      id: Number(entity.id),
      userId: Number(entity.userId),
      name: entity.name,
      isDefault: entity.isDefault,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      user: entity.user ? { id: Number(entity.user.id), name: entity.user.name, email: entity.user.email } : undefined,
      items: items.map((item) => ({
        id: Number(item.id),
        courseId: Number(item.courseId),
        addedAt: item.addedAt,
        note: item.note,
        course: item.course ? { id: Number(item.course.id), title: item.course.title, thumbnail: item.course.thumbnail } : undefined,
      })),
    };
  }

  async remove(id: number) {
    const entity = await this.repo.findOne({ where: { id: id.toString() } });
    if (!entity) return null;
    await this.repo.remove(entity);
    return { id };
  }

  async removeItem(wishlistId: number, itemId: number) {
    const item = await this.itemRepo.findOne({ where: { id: itemId.toString(), wishlistId: wishlistId.toString() } });
    if (!item) return null;
    await this.itemRepo.remove(item);
    return { id: itemId };
  }
}
