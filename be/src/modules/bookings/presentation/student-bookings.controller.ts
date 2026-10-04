import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetBookingsQuery } from '@/modules/bookings/application/query/get-bookings.query';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class StudentBookingsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  findAll(
    @CurrentUser('id') studentId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('bookingDate') bookingDate?: string,
  ) {
    return this.queryBus.execute(
      new GetBookingsQuery(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        undefined,
        undefined,
        studentId,
        status !== undefined && status !== ''
          ? parseInt(status, 10)
          : undefined,
        bookingDate,
      ),
    );
  }
}
