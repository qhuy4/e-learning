import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PaginationDto } from '@/common/pagination/pagination.dto';
import { GetReviewsQuery } from '@/modules/reviews/application/query/get-reviews.query';
import { GetReviewByIdQuery } from '@/modules/reviews/application/query/get-review-by-id.query';
import { UpdateReviewStatusCommand } from '@/modules/reviews/application/command/update-review-status.command';

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ReviewsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll(
    @Query() query: PaginationDto,
    @Query('keyword') keyword?: string,
    @Query('courseId') courseId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: number,
  ) {
    return this.queryBus.execute(new GetReviewsQuery({
      page: query.page,
      limit: query.limit,
      keyword,
      courseId,
      userId,
      status,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    }));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetReviewByIdQuery({ id }));
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Query('status') status: number) {
    return this.commandBus.execute(new UpdateReviewStatusCommand({ id, status }));
  }
}
