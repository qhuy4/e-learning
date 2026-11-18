import { PayoutAccount } from '@/modules/instructor-payouts/domain/entity/payout-account.entity';
import { PayoutAccountOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/payout-account.orm-entity';

export const PAYOUT_ACCOUNT_REPOSITORY = 'PAYOUT_ACCOUNT_REPOSITORY';

export interface IPayoutAccountRepository {
  findByInstructorProfileId(
    instructorProfileId: number,
  ): Promise<PayoutAccount[]>;
  findById(id: number): Promise<PayoutAccount | null>;
  create(data: Partial<PayoutAccountOrmEntity>): Promise<PayoutAccount | null>;
  update(
    id: number,
    data: Partial<PayoutAccountOrmEntity>,
  ): Promise<PayoutAccount | null>;
  delete(id: number): Promise<void>;
}
