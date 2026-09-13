import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayoutAccountOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/payout-account.orm-entity';
import { IPayoutAccountRepository } from '@/modules/instructor-payouts/domain/repository/payout-account.repository';
import { PayoutAccountMapper } from '@/modules/instructor-payouts/infrastructure/mapper/payout-account.mapper';

@Injectable()
export class PayoutAccountRepository implements IPayoutAccountRepository {
  constructor(
    @InjectRepository(PayoutAccountOrmEntity)
    private readonly repository: Repository<PayoutAccountOrmEntity>,
  ) {}

  async findByInstructorProfileId(instructorProfileId: number) {
    const entities = await this.repository.find({
      where: { instructorProfileId: instructorProfileId.toString() },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
    return entities.map((e) => PayoutAccountMapper.toDomain(e));
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
    });
    if (!entity) return null;
    return PayoutAccountMapper.toDomain(entity);
  }

  async create(data: Partial<PayoutAccountOrmEntity>) {
    const entity = this.repository.create(data);
    const saved = await this.repository.save(entity);
    return this.findById(Number(saved.id));
  }

  async update(id: number, data: Partial<PayoutAccountOrmEntity>) {
    await this.repository.update(id.toString(), data);
    return this.findById(id);
  }

  async delete(id: number) {
    await this.repository.delete(id.toString());
  }
}
