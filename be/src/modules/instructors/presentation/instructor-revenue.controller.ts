import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetInstructorRevenueSummaryQuery } from '@/modules/instructors/application/query/get-instructor-revenue-summary.query';
import { GetInstructorRevenueByCourseQuery } from '@/modules/instructors/application/query/get-instructor-revenue-by-course.query';

@Controller('instructor/revenue')
@UseGuards(JwtAuthGuard)
export class InstructorRevenueController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('summary')
  getSummary(@CurrentUser('id') userId: number) {
    return this.queryBus.execute(new GetInstructorRevenueSummaryQuery(userId));
  }

  @Get('by-course')
  getByCourse(
    @CurrentUser('id') userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.queryBus.execute(
      new GetInstructorRevenueByCourseQuery(
        userId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
      ),
    );
  }
}
