import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetHomeStatsQuery } from '../application/query/get-home-stats.query';
import { GetHomeCoursesQuery } from '../application/query/get-home-courses.query';

@Controller('home')
export class HomeController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('stats')
  getStats() {
    return this.queryBus.execute(new GetHomeStatsQuery());
  }

  @Get('courses')
  getCourses(@Query('limit') limit?: number) {
    return this.queryBus.execute(new GetHomeCoursesQuery(limit ?? 8));
  }
}
