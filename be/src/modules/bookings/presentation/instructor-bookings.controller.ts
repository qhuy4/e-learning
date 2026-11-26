import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { GetBookingsQuery } from '@/modules/bookings/application/query/get-bookings.query';
import { GetBookingByIdQuery } from '@/modules/bookings/application/query/get-booking-by-id.query';
import { UpdateBookingStatusCommand } from '@/modules/bookings/application/command/update-booking-status.command';
import { UpdateBookingStatusDto } from '@/modules/bookings/presentation/dto/update-booking-status.dto';
import { BookingRepository } from '@/modules/bookings/infrastructure/repository/booking.repository';

@Controller('instructor/bookings')
@UseGuards(JwtAuthGuard)
export class InstructorBookingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly bookingRepository: BookingRepository,
  ) {}

  @Get()
  findAll(
    @CurrentUser('id') instructorId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('bookingDate') bookingDate?: string,
  ) {
    return this.queryBus.execute(
      new GetBookingsQuery(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        keyword,
        instructorId,
        undefined,
        status !== undefined && status !== ''
          ? parseInt(status, 10)
          : undefined,
        bookingDate,
      ),
    );
  }

  @Get(':id')
  async findOne(
    @CurrentUser('id') instructorId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.assertOwnership(id, instructorId);

    return this.queryBus.execute(new GetBookingByIdQuery(id));
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentUser('id') instructorId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    await this.assertOwnership(id, instructorId);
    return this.commandBus.execute(
      new UpdateBookingStatusCommand(id, dto.status, true),
    );
  }

  private async assertOwnership(id: number, instructorId: number) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking || booking.instructorId !== instructorId) {
      throw new AppException(ErrorCode.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }
}
