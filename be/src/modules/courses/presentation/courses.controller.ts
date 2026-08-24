import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { QueryBus, CommandBus } from '@nestjs/cqrs';

import { GetCoursesDto } from './dto/get-courses.dto';
import { GetCoursesQuery } from '../application/query/get-courses.query';

import { GetCourseBySlugQuery } from '../application/query/get-course-by-slug.query';

import { CourseResponseDto } from './dto/course-response.dto';
import { CourseDetailResponseDto } from './dto/course-detail-response.dto';

import { CreateCourseDto } from './dto/create-course.dto';
import { CreateCourseCommand } from '../application/command/create-course.command';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async findAll(@Query() query: GetCoursesDto) {
    return this.queryBus.execute<GetCoursesQuery, CourseResponseDto[]>(
      new GetCoursesQuery(
        query.page ?? 1,
        query.limit ?? 10,
        query.level,
        query.keyword,
      ),
    );
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.queryBus.execute<GetCourseBySlugQuery, CourseDetailResponseDto>(
      new GetCourseBySlugQuery(slug),
    );
  }

  @Post()
  @UseInterceptors(FileInterceptor('thumbnail'))
  async create(
    @Body() dto: CreateCourseDto,

    @UploadedFile()
    thumbnail: Express.Multer.File,
  ) {
    return this.commandBus.execute(
      new CreateCourseCommand(
        1,
        dto.title,
        dto.description,
        thumbnail,
        dto.level,
        dto.price,
        dto.parentId,
      ),
    );
  }
}
