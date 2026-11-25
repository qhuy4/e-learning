import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { GetAdminEnrollmentsQuery } from '@/modules/enrollments/application/query/get-admin-enrollments.query';
import { GetAdminEnrollmentByIdQuery } from '@/modules/enrollments/application/query/get-admin-enrollment-by-id.query';
import { AdminEnrollmentsPage } from '@/modules/enrollments/application/query/get-admin-enrollments.query';
import { AdminEnrollmentDetailResponseDto } from '@/modules/enrollments/presentation/dto/admin-enrollment-detail-response.dto';

@Controller('admin/enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminEnrollmentsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.queryBus.execute<
      GetAdminEnrollmentsQuery,
      AdminEnrollmentsPage
    >(
      new GetAdminEnrollmentsQuery({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        keyword,
        status: status !== undefined ? Number(status) : undefined,
        sortBy,
        sortOrder,
      }),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute<
      GetAdminEnrollmentByIdQuery,
      AdminEnrollmentDetailResponseDto
    >(new GetAdminEnrollmentByIdQuery({ id }));
  }
}
