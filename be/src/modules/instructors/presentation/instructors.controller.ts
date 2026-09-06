import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PaginationDto } from '@/common/pagination/pagination.dto';
import { GetInstructorsQuery } from '@/modules/instructors/application/query/get-instructors.query';
import { GetInstructorByIdQuery } from '@/modules/instructors/application/query/get-instructor-by-id.query';
import { UpdateInstructorCommand } from '@/modules/instructors/application/command/update-instructor.command';
import { UpdateInstructorDto } from '@/modules/instructors/presentation/dto/common/update-instructor.dto';

@Controller('admin/instructors')
export class InstructorsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll(@Query() query: PaginationDto, @Query('keyword') keyword?: string) {
    const data = {
      page: query.page,
      limit: query.limit,
      keyword,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    return this.queryBus.execute(new GetInstructorsQuery(data));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetInstructorByIdQuery({ id }));
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInstructorDto,
  ) {
    return this.commandBus.execute(
      new UpdateInstructorCommand({
        id,
        ...dto,
      }),
    );
  }
}
