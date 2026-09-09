import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetInstructorEnrollmentsQuery } from '@/modules/enrollments/application/query/get-instructor-enrollments.query';

@UseGuards(JwtAuthGuard)
@Controller('instructor/enrollments')
export class InstructorEnrollmentsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async findAll(
    @CurrentUser('id') instructorId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.queryBus.execute(
      new GetInstructorEnrollmentsQuery({
        instructorId,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        keyword,
        status: status !== undefined ? Number(status) : undefined,
        courseId: courseId !== undefined ? Number(courseId) : undefined,
      }),
    );
  }
}
