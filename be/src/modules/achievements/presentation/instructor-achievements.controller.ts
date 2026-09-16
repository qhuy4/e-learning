import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GetUserAchievementsQuery } from '@/modules/achievements/application/query/get-user-achievements.query';

@Controller('instructor/achievements')
@UseGuards(JwtAuthGuard)
export class InstructorAchievementsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async findOwn(@Request() req: any) {
    const userId = req.user?.id ?? 1;
    return this.queryBus.execute(new GetUserAchievementsQuery(userId));
  }
}
