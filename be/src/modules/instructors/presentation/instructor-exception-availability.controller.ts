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
import { GetExceptionAvailabilityQuery } from '@/modules/instructors/application/query/get-exception-availability.query';
import { CreateExceptionAvailabilityCommand } from '@/modules/instructors/application/command/create-exception-availability.command';
import { UpdateExceptionAvailabilityCommand } from '@/modules/instructors/application/command/update-exception-availability.command';
import { DeleteExceptionAvailabilityCommand } from '@/modules/instructors/application/command/delete-exception-availability.command';

@Controller('instructor/availability/exceptions')
@UseGuards(JwtAuthGuard)
export class InstructorExceptionAvailabilityController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  findAll(@CurrentUser('id') userId: number) {
    return this.queryBus.execute(new GetExceptionAvailabilityQuery(userId));
  }

  @Post()
  create(
    @CurrentUser('id') userId: number,
    @Body()
    body: {
      specific_date: string;
      is_unavailable: boolean;
      is_extra?: boolean;
      start_time?: string;
      end_time?: string;
      reason?: string;
    },
  ) {
    return this.commandBus.execute(
      new CreateExceptionAvailabilityCommand(userId, body),
    );
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, any>,
  ) {
    return this.commandBus.execute(
      new UpdateExceptionAvailabilityCommand(id, userId, body),
    );
  }

  @Delete(':id')
  remove(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commandBus.execute(
      new DeleteExceptionAvailabilityCommand(id, userId),
    );
  }
}
