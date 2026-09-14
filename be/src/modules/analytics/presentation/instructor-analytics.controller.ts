import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GetCourseAnalyticsQuery } from '@/modules/analytics/application/query/get-course-analytics.query';

@UseGuards(JwtAuthGuard)
@Controller('instructor/analytics')
export class InstructorAnalyticsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('courses/:courseId')
  async getCourseAnalytics(
    @CurrentUser('id') instructorId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('dateRange') dateRange?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.queryBus.execute(
      new GetCourseAnalyticsQuery(instructorId, courseId, dateRange ?? '30d', startDate, endDate),
    );
  }
}
