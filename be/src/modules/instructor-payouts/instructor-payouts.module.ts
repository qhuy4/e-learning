import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { RevenueSplitOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/revenue-split.orm-entity';
import { InstructorPayoutOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/instructor-payout.orm-entity';
import { PayoutAccountOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/payout-account.orm-entity';

import { RevenueSplitRepository } from '@/modules/instructor-payouts/infrastructure/repository/revenue-split.repository';
import { InstructorPayoutRepository } from '@/modules/instructor-payouts/infrastructure/repository/instructor-payout.repository';
import { PayoutAccountRepository } from '@/modules/instructor-payouts/infrastructure/repository/payout-account.repository';
import { REVENUE_SPLIT_REPOSITORY } from '@/modules/instructor-payouts/domain/repository/revenue-split.repository';
import { INSTRUCTOR_PAYOUT_REPOSITORY } from '@/modules/instructor-payouts/domain/repository/instructor-payout.repository';
import { PAYOUT_ACCOUNT_REPOSITORY } from '@/modules/instructor-payouts/domain/repository/payout-account.repository';

import { GetAdminRevenueSplitsHandler } from '@/modules/instructor-payouts/application/query-handler/get-admin-revenue-splits.handler';
import { GetAdminRevenueSummaryHandler } from '@/modules/instructor-payouts/application/query-handler/get-admin-revenue-summary.handler';
import { GetAdminPayoutsHandler } from '@/modules/instructor-payouts/application/query-handler/get-admin-payouts.handler';
import { GetAdminPayoutDetailHandler } from '@/modules/instructor-payouts/application/query-handler/get-admin-payout-detail.handler';
import { GetInstructorPayoutAccountsHandler } from '@/modules/instructor-payouts/application/query-handler/get-instructor-payout-accounts.handler';
import { CreatePayoutHandler } from '@/modules/instructor-payouts/application/command-handler/create-payout.handler';
import { UpdatePayoutStatusHandler } from '@/modules/instructor-payouts/application/command-handler/update-payout-status.handler';
import { CreatePayoutAccountHandler } from '@/modules/instructor-payouts/application/command-handler/create-payout-account.handler';
import { UpdatePayoutAccountHandler } from '@/modules/instructor-payouts/application/command-handler/update-payout-account.handler';
import { DeletePayoutAccountHandler } from '@/modules/instructor-payouts/application/command-handler/delete-payout-account.handler';

import { AdminRevenueController } from '@/modules/instructor-payouts/presentation/admin-revenue.controller';
import { AdminPayoutsController } from '@/modules/instructor-payouts/presentation/admin-payouts.controller';
import { AdminPayoutAccountsController } from '@/modules/instructor-payouts/presentation/admin-payout-accounts.controller';

const QueryHandlers = [
  GetAdminRevenueSplitsHandler,
  GetAdminRevenueSummaryHandler,
  GetAdminPayoutsHandler,
  GetAdminPayoutDetailHandler,
  GetInstructorPayoutAccountsHandler,
];

const CommandHandlers = [
  CreatePayoutHandler,
  UpdatePayoutStatusHandler,
  CreatePayoutAccountHandler,
  UpdatePayoutAccountHandler,
  DeletePayoutAccountHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      RevenueSplitOrmEntity,
      InstructorPayoutOrmEntity,
      PayoutAccountOrmEntity,
    ]),
  ],
  controllers: [AdminRevenueController, AdminPayoutsController, AdminPayoutAccountsController],
  providers: [
    RevenueSplitRepository,
    InstructorPayoutRepository,
    PayoutAccountRepository,
    {
      provide: REVENUE_SPLIT_REPOSITORY,
      useExisting: RevenueSplitRepository,
    },
    {
      provide: INSTRUCTOR_PAYOUT_REPOSITORY,
      useExisting: InstructorPayoutRepository,
    },
    {
      provide: PAYOUT_ACCOUNT_REPOSITORY,
      useExisting: PayoutAccountRepository,
    },
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [REVENUE_SPLIT_REPOSITORY, INSTRUCTOR_PAYOUT_REPOSITORY, PAYOUT_ACCOUNT_REPOSITORY],
})
export class InstructorPayoutsModule {}
