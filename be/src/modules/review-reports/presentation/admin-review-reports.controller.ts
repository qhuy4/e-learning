import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { GetAdminReviewReportsQuery } from '@/modules/review-reports/application/query/get-admin-review-reports.query';
import { GetAdminReviewReportDetailQuery } from '@/modules/review-reports/application/query/get-admin-review-report-detail.query';
import { ResolveReviewReportCommand } from '@/modules/review-reports/application/command/resolve-review-report.command';
import { DismissReviewReportCommand } from '@/modules/review-reports/application/command/dismiss-review-report.command';
import { DeleteReviewReportCommand } from '@/modules/review-reports/application/command/delete-review-report.command';
import { AdminReviewReportResponseMapper } from '@/modules/review-reports/presentation/mapper/admin-review-report-response.mapper';
import { AuthenticatedUser } from '@/common/decorators/current-user.decorator';
import { ReviewReport } from '@/modules/review-reports/domain/entity/review-report.entity';
import { AdminReviewReportsPage } from '@/modules/review-reports/domain/repository/review-report.repository';

@Controller('admin/review-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminReviewReportsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.queryBus.execute<
      GetAdminReviewReportsQuery,
      AdminReviewReportsPage
    >(
      new GetAdminReviewReportsQuery({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        status: status !== undefined ? parseInt(status, 10) : undefined,
        keyword,
        sortBy,
        sortOrder,
      }),
    );

    return {
      data: result.data.map((report) =>
        AdminReviewReportResponseMapper.toResponse(report),
      ),
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const report = await this.queryBus.execute<
      GetAdminReviewReportDetailQuery,
      ReviewReport
    >(new GetAdminReviewReportDetailQuery({ id }));
    return AdminReviewReportResponseMapper.toResponse(report);
  }

  @Patch(':id/resolve')
  async resolve(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: AuthenticatedUser },
  ) {
    const report = await this.commandBus.execute<
      ResolveReviewReportCommand,
      ReviewReport
    >(new ResolveReviewReportCommand({ id, resolvedBy: req.user.id }));
    return AdminReviewReportResponseMapper.toResponse(report);
  }

  @Patch(':id/dismiss')
  async dismiss(@Param('id', ParseIntPipe) id: number) {
    const report = await this.commandBus.execute<
      DismissReviewReportCommand,
      ReviewReport
    >(new DismissReviewReportCommand({ id }));
    return AdminReviewReportResponseMapper.toResponse(report);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.commandBus.execute<DeleteReviewReportCommand, void>(
      new DeleteReviewReportCommand({ id }),
    );
  }
}
