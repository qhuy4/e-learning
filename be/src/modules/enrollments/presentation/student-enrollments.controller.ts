import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { GetMyEnrollmentsQuery } from '@/modules/enrollments/application/query/get-my-enrollments.query';
import { CheckEnrollmentQuery } from '@/modules/enrollments/application/query/check-enrollment.query';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class StudentEnrollmentsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('my')
  findMyEnrollments(
    @CurrentUser('id') userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.queryBus.execute(
      new GetMyEnrollmentsQuery({
        userId,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      }),
    );
  }

  @Get('check')
  checkEnrollment(
    @CurrentUser('id') userId: number,
    @Query('courseSlug') courseSlug: string,
  ) {
    return this.queryBus.execute(
      new CheckEnrollmentQuery({
        userId,
        courseSlug,
      }),
    );
  }
}
