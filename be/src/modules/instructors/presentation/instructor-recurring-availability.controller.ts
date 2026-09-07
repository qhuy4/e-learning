import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetRecurringAvailabilityQuery } from '@/modules/instructors/application/query/get-recurring-availability.query';
import { CreateRecurringAvailabilityCommand } from '@/modules/instructors/application/command/create-recurring-availability.command';
import { UpdateRecurringAvailabilityCommand } from '@/modules/instructors/application/command/update-recurring-availability.command';
import { DeleteRecurringAvailabilityCommand } from '@/modules/instructors/application/command/delete-recurring-availability.command';

@Controller('instructor/availability/recurring')
@UseGuards(JwtAuthGuard)
export class InstructorRecurringAvailabilityController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  findAll(@CurrentUser('id') userId: number) {
    return this.queryBus.execute(new GetRecurringAvailabilityQuery(userId));
  }

  @Post()
  create(
    @CurrentUser('id') userId: number,
    @Body() body: {
      day_of_week: number;
      start_time: string;
      end_time: string;
      effective_from: string;
      effective_until?: string;
      is_active?: boolean;
    },
  ) {
    return this.commandBus.execute(
      new CreateRecurringAvailabilityCommand(userId, body),
    );
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, any>,
  ) {
    return this.commandBus.execute(
      new UpdateRecurringAvailabilityCommand(id, userId, body),
    );
  }

  @Delete(':id')
  remove(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commandBus.execute(
      new DeleteRecurringAvailabilityCommand(id, userId),
    );
  }
}
