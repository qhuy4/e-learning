import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { JwtOptionalAuthGuard } from '@/common/guards/jwt-optional.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { GetMyEnrollmentsQuery } from '@/modules/enrollments/application/query/get-my-enrollments.query';
import { CheckEnrollmentQuery } from '@/modules/enrollments/application/query/check-enrollment.query';

@Controller('enrollments')
export class StudentEnrollmentsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyEnrollments(
    @CurrentUser('id') userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.queryBus.execute(
      new GetMyEnrollmentsQuery({
        userId,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        keyword: keyword?.trim() || undefined,
        status: status !== undefined && status !== '' ? Number(status) : undefined,
        sortBy: sortBy?.trim() || undefined,
        sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined,
      }),
    );
  }

  @Get('check')
  @UseGuards(JwtOptionalAuthGuard)
  async checkEnrollment(
    @CurrentUser('id') userId: number | undefined,
    @Query('courseSlug') courseSlug: string,
  ) {
    if (!userId) {
      return { enrolled: false, enrollment: null };
    }
    return this.queryBus.execute(
      new CheckEnrollmentQuery({
        userId,
        courseSlug,
      }),
    );
  }
}
