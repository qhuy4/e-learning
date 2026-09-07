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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { QueryBus, CommandBus } from '@nestjs/cqrs';

import { GetCoursesDto } from '@/modules/courses/presentation/dto/get-courses.dto';
import { GetCoursesQuery } from '@/modules/courses/application/query/get-courses.query';

import { GetCourseBySlugQuery } from '@/modules/courses/application/query/get-course-by-slug.query';

import { CourseResponseDto } from '@/modules/courses/presentation/dto/course-response.dto';
import { CourseDetailResponseDto } from '@/modules/courses/presentation/dto/course-detail-response.dto';

import { CreateCourseDto } from '@/modules/courses/presentation/dto/create-course.dto';
import { CreateCourseCommand } from '@/modules/courses/application/command/create-course.command';
import { GetCourseByIdQuery } from '@/modules/courses/application/query/get-course-by-id.query';

import { UpdateCourseDto } from '@/modules/courses/presentation/dto/update-course.dto';
import { UpdateCourseCommand } from '@/modules/courses/application/command/update-course.command';
import { DeleteCourseCommand } from '@/modules/courses/application/command/delete-course.command';

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
        query.status,
      ),
    );
  }

  @Get('id/:id')
  async findById(@Param('id') id: string) {
    return this.queryBus.execute<GetCourseByIdQuery, CourseDetailResponseDto>(
      new GetCourseByIdQuery(id),
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

  @Patch(':id')
  @UseInterceptors(FileInterceptor('thumbnail'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ) {
    return this.commandBus.execute(
      new UpdateCourseCommand(id, {
        title: dto.title,
        description: dto.description,
        thumbnailFile: thumbnail,
        level: dto.level,
        price: dto.price,
        status: dto.status,
        parentId: dto.parentId,
      }),
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteCourseCommand(id));
  }
}
