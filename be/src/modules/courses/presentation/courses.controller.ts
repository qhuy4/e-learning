import { Controller, Get, Param, Query } from '@nestjs/common';

import { QueryBus } from '@nestjs/cqrs';

import { GetCoursesDto } from './dto/get-courses.dto';

import { GetCoursesQuery } from '../application/query/get-courses.query';

// import { GetCourseByIdQuery } from '../application/query/get-course-by-id.query';

import { GetCourseBySlugQuery } from '../application/query/get-course-by-slug.query';
import { CourseResponseDto } from './dto/course-response.dto';
import { CourseDetailResponseDto } from './dto/course-detail-response.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly queryBus: QueryBus) {}

  /**
   * GET /courses
   *
   * GET /courses?page=1&limit=12
   * GET /courses?level=1
   * GET /courses?keyword=nestjs
   */
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

  /**
   * GET /courses/slug/nestjs-for-beginners
   */
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.queryBus.execute<GetCourseBySlugQuery, CourseDetailResponseDto>(
      new GetCourseBySlugQuery(slug),
    );
  }

  /**
   * GET /courses/123
   */
  // @Get(':id')
  // async findById(@Param('id') id: string) {
  //   return this.queryBus.execute<GetCourseByIdQuery, CourseResponseDto>(
  //     new GetCourseByIdQuery(id),
  //   );
  // }
}
