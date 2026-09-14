import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PremiumSubscriptionOrmEntity } from '@/modules/premium-subscriptions/infrastructure/entity/premium-subscription.orm-entity';
import { PremiumSubscriptionRepository } from '@/modules/premium-subscriptions/infrastructure/repository/premium-subscription.repository';
import { AdminPremiumSubscriptionsController } from '@/modules/premium-subscriptions/presentation/admin-premium-subscriptions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PremiumSubscriptionOrmEntity])],
  controllers: [AdminPremiumSubscriptionsController],
  providers: [PremiumSubscriptionRepository],
  exports: [PremiumSubscriptionRepository],
})
export class PremiumSubscriptionsModule {}
