import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import {
  GetUserAchievementsQuery,
  UserAchievementsResult,
} from '@/modules/achievements/application/query/get-user-achievements.query';
import { AuthenticatedUser } from '@/common/decorators/current-user.decorator';

@Controller('instructor/achievements')
@UseGuards(JwtAuthGuard)
export class InstructorAchievementsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async findOwn(@Request() req: { user?: AuthenticatedUser }) {
    const userId = req.user?.id ?? 1;
    return this.queryBus.execute<
      GetUserAchievementsQuery,
      UserAchievementsResult
    >(new GetUserAchievementsQuery(userId));
  }
}
