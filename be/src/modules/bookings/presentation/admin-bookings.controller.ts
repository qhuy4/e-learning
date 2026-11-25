import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { GetBookingsQuery } from '@/modules/bookings/application/query/get-bookings.query';
import { GetBookingByIdQuery } from '@/modules/bookings/application/query/get-booking-by-id.query';
import { CreateBookingCommand } from '@/modules/bookings/application/command/create-booking.command';
import { UpdateBookingStatusCommand } from '@/modules/bookings/application/command/update-booking-status.command';
import { DeleteBookingCommand } from '@/modules/bookings/application/command/delete-booking.command';
import { CreateBookingDto } from '@/modules/bookings/presentation/dto/create-booking.dto';
import { UpdateBookingStatusDto } from '@/modules/bookings/presentation/dto/update-booking-status.dto';

@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminBookingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('keyword') keyword?: string,
    @Query('instructorId') instructorId?: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
    @Query('bookingDate') bookingDate?: string,
  ) {
    return this.queryBus.execute(
      new GetBookingsQuery(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        keyword,
        instructorId ? parseInt(instructorId, 10) : undefined,
        studentId ? parseInt(studentId, 10) : undefined,
        status !== undefined ? parseInt(status, 10) : undefined,
        bookingDate,
      ),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetBookingByIdQuery(id));
  }

  @Post()
  async create(@Body() dto: CreateBookingDto) {
    return this.commandBus.execute(
      new CreateBookingCommand(
        dto.studentId,
        dto.instructorId,
        dto.bookingDate,
        dto.startTime,
        dto.endTime,
        dto.notes,
      ),
    );
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.commandBus.execute(
      new UpdateBookingStatusCommand(id, dto.status),
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteBookingCommand(id));
  }
}
