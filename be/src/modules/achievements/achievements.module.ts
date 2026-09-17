import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { StorageModule } from '@/common/storage/storage.module';
import { AchievementOrmEntity } from './infrastructure/entity/achievement.orm-entity';
import { UserAchievementOrmEntity } from './infrastructure/entity/user-achievement.orm-entity';
import { AchievementRepository } from './infrastructure/repository/achievement.repository';
import { UserAchievementRepository } from './infrastructure/repository/user-achievement.repository';
import { AdminAchievementsController } from './presentation/admin-achievements.controller';
import { InstructorAchievementsController } from './presentation/instructor-achievements.controller';
import { CreateAchievementHandler } from './application/command-handler/create-achievement.handler';
import { UpdateAchievementHandler } from './application/command-handler/update-achievement.handler';
import { DeleteAchievementHandler } from './application/command-handler/delete-achievement.handler';
import { AwardAchievementHandler } from './application/command-handler/award-achievement.handler';
import { GetAchievementsHandler } from './application/query-handler/get-achievements.handler';
import { GetAchievementByIdHandler } from './application/query-handler/get-achievement-by-id.handler';
import { GetUserAchievementsHandler } from './application/query-handler/get-user-achievements.handler';
import { AchievementEvaluator } from './application/achievement-evaluator.service';
import { AchievementEventHandler } from './application/event-handler/achievement.event-handler';

const QueryHandlers = [GetAchievementsHandler, GetAchievementByIdHandler, GetUserAchievementsHandler];
const CommandHandlers = [CreateAchievementHandler, UpdateAchievementHandler, DeleteAchievementHandler, AwardAchievementHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([AchievementOrmEntity, UserAchievementOrmEntity]),
    CqrsModule,
    StorageModule,
  ],
  controllers: [AdminAchievementsController, InstructorAchievementsController],
  providers: [
    AchievementRepository,
    UserAchievementRepository,
    AchievementEvaluator,
    AchievementEventHandler,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [AchievementRepository, UserAchievementRepository, AchievementEvaluator],
})
export class AchievementsModule {}
