import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAvailableTeachersQuery } from '@/modules/bookings/application/query/get-available-teachers';
import { GetInstructorSlotsQuery } from '@/modules/bookings/application/query/get-instructor-slots.query';
import { GetInstructorWindowQuery } from '@/modules/bookings/application/query/get-instructor-window.query';
import { PaginationDto } from '@/common/pagination/pagination.dto';

@Controller('availabilities')
export class AvailabilityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** Day window + busy blocks for one instructor. */
  @Get('window')
  async findWindow(
    @Query('instructorId') instructorId: string,
    @Query('bookingDate') bookingDate: string,
  ) {
    const id = parseInt(instructorId, 10);
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('instructorId is required');
    }
    if (!bookingDate?.trim()) {
      throw new BadRequestException('bookingDate is required');
    }
    return this.queryBus.execute(
      new GetInstructorWindowQuery({ instructorId: id, bookingDate }),
    );
  }

  /** One request → free/busy map for many slots of a single instructor. */
  @Get('slots')
  async findSlots(
    @Query('instructorId') instructorId: string,
    @Query('bookingDate') bookingDate: string,
    @Query('slots') slots: string,
    @Query('durationMinutes') durationMinutes?: string,
  ) {
    const id = parseInt(instructorId, 10);
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('instructorId is required');
    }
    if (!bookingDate?.trim()) {
      throw new BadRequestException('bookingDate is required');
    }

    const slotList = (slots ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!slotList.length) {
      throw new BadRequestException('slots is required');
    }

    const duration = Math.max(1, parseInt(durationMinutes ?? '15', 10) || 15);

    return this.queryBus.execute(
      new GetInstructorSlotsQuery({
        instructorId: id,
        bookingDate,
        slots: slotList,
        durationMinutes: duration,
      }),
    );
  }

  @Get()
  async findAll(
    @Query() query: PaginationDto,
    @Query('keyword') keyword?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('bookingDate') bookingDate?: string,
  ) {
    return this.queryBus.execute(
      new GetAvailableTeachersQuery({
        page: query.page,
        limit: query.limit,
        bookingDate,
        startTime,
        endTime,
        keyword,
      }),
    );
  }
}
