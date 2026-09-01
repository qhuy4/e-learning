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
import { GetInstructorProfileQuery } from '@/modules/instructors/application/query/get-instructor-profile.query';


@Controller('admin/instructors')
export class InstructorProfileController {
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
    };

    return this.queryBus.execute(new GetInstructorProfileQuery(data));
  }
}
