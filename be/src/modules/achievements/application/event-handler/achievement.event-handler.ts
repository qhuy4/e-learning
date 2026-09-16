import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { LearningEvent } from '@/modules/achievements/application/event/learning.event';
import { AchievementEvaluator } from '@/modules/achievements/application/achievement-evaluator.service';

@EventsHandler(LearningEvent)
export class AchievementEventHandler implements IEventHandler<LearningEvent> {
  private readonly logger = new Logger(AchievementEventHandler.name);

  constructor(private readonly evaluator: AchievementEvaluator) {}

  async handle(event: LearningEvent): Promise<void> {
    this.logger.log(
      `Processing learning event: userId=${event.userId}, type=${event.type}`,
    );

    try {
      await this.evaluator.evaluate(event.userId, event.type);
    } catch (error) {
      this.logger.error(
        `Failed to evaluate achievement for user ${event.userId}: ${(error as Error).message}`,
      );
    }
  }
}
