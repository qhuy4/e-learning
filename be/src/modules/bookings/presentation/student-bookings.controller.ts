import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetBookingsQuery } from '@/modules/bookings/application/query/get-bookings.query';
import { CreateBookingCheckoutDto } from '@/modules/bookings/presentation/dto/create-booking-checkout.dto';
import { BookingCheckoutService } from '@/modules/bookings/application/booking-checkout.service';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class StudentBookingsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly checkoutService: BookingCheckoutService,
  ) {}

  @Post('checkout/:instructorId')
  async checkout(
    @CurrentUser('id') studentId: number,
    @Param('instructorId', ParseIntPipe) instructorId: number,
    @Body() dto: CreateBookingCheckoutDto,
  ) {
    return this.checkoutService.createCheckout({
      studentId,
      instructorId,
      ...dto,
    });
  }

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

@Controller('bookings/payment')
export class BookingPaymentCallbackController {
  constructor(private readonly checkoutService: BookingCheckoutService) {}

  @Get('vnpay')
  async handleVnpayCallback(@Req() req: Request, @Res() res: Response) {
    const query = Object.fromEntries(
      Object.entries(req.query).map(([key, value]) => [key, String(value)]),
    );
    const result = await this.checkoutService.processVnpayCallback(query);
    const params = new URLSearchParams({
      ...query,
      type: 'booking',
      bookingId: result.bookingId ? String(result.bookingId) : '',
      status: result.success ? 'success' : 'failed',
    });

    return res.redirect(
      `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/payment/result?${params.toString()}`,
    );
  }
}
