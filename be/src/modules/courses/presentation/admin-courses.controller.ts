import { Controller, Get, Param, Patch, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PaginationDto } from '@/common/pagination/pagination.dto';
import { GetAdminCoursesQuery } from '@/modules/courses/application/query/get-admin-courses.query';
import { GetAdminCourseByIdQuery } from '@/modules/courses/application/query/get-admin-course-by-id.query';
import { ReviewCourseCommand } from '@/modules/courses/application/command/review-course.command';
import { UpdateLessonCommand } from '@/modules/lessons/application/command/update-lesson.command';

@Controller('admin/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminCoursesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll(
    @Query() query: PaginationDto,
    @Query('keyword') keyword?: string,
    @Query('status') status?: number,
    @Query('instructorId') instructorId?: number,
  ) {
    return this.queryBus.execute(
      new GetAdminCoursesQuery({
        page: query.page,
        limit: query.limit,
        keyword,
        status,
        instructorId,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetAdminCourseByIdQuery({ id }));
  }

  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @Body() body: { status: number; rejectReason?: string },
  ) {
    return this.commandBus.execute(
      new ReviewCourseCommand({
        id,
        status: body.status,
        rejectReason: body.rejectReason,
      }),
    );
  }

  @Patch('lessons/:lessonId/preview')
  togglePreview(
    @Param('lessonId') lessonId: string,
    @Body() body: { isPreview: boolean },
  ) {
    return this.commandBus.execute(
      new UpdateLessonCommand(Number(lessonId), {
        isPreview: body.isPreview,
      }),
    );
  }

  @Patch('lessons/:lessonId/status')
  toggleStatus(
    @Param('lessonId') lessonId: string,
    @Body() body: { status: number },
  ) {
    return this.commandBus.execute(
      new UpdateLessonCommand(Number(lessonId), {
        status: body.status,
      }),
    );
  }
}
