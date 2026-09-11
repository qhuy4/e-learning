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
  UseGuards,
  UseInterceptors,
  Req,
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
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GetAdminCoursesQuery } from '@/modules/courses/application/query/get-admin-courses.query';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PreviewCourseQuery } from '@/modules/courses/application/query/preview-course.query';
import { User } from '@/modules/users/domain/entity/user.entity';
import { CreatePreviewTokenCommand } from '@/modules/courses/application/command/create-preview-token.command';
import { CloneCourseCommand } from '@/modules/courses/application/command/clone-course.command';
import { Course } from '@/modules/courses/domain/entity/course.entity';
import { RejectCourseCommand } from '@/modules/courses/application/command/reject-course.command';
import { ApproveCourseCommand } from '@/modules/courses/application/command/approve-course.command';
import { CancelReviewCourseCommand } from '@/modules/courses/application/command/cancel-review-course.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseViewOrmEntity } from '@/modules/analytics/infrastructure/entity/course-view.orm-entity';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @InjectRepository(CourseViewOrmEntity)
    private readonly courseViewRepo: Repository<CourseViewOrmEntity>,
  ) {}

  @Get()
  async findAll(@Query() query: GetCoursesDto): Promise<CourseResponseDto[]> {
    return this.queryBus.execute<GetCoursesQuery, CourseResponseDto[]>(
      new GetCoursesQuery(
        query.page ?? 1,
        query.limit ?? 10,
        query.level,
        query.keyword,
        query.status,
        query.instructorId,
      ),
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  async findAdminCourses(
    @Query() query: GetCoursesDto,
  ): Promise<CourseResponseDto[]> {
    return this.queryBus.execute<GetAdminCoursesQuery, CourseResponseDto[]>(
      new GetAdminCoursesQuery({
        page: query.page ?? 1,
        limit: query.limit ?? 12,
        level: query.level,
        keyword: query.keyword,
        status: query.status,
        instructorId: query.instructorId,
      }),
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMyCourses(
    @CurrentUser() user: any,
    @Query() query: GetCoursesDto,
  ): Promise<CourseResponseDto[]> {
    return this.queryBus.execute<GetCoursesQuery, CourseResponseDto[]>(
      new GetCoursesQuery(
        query.page ?? 1,
        query.limit ?? 10,
        query.level,
        query.keyword,
        query.status,
        1,
      ),
    );
  }

  @Get('preview')
  async previewCourse(
    @Query('token') token: string,
  ): Promise<CourseDetailResponseDto> {
    return this.queryBus.execute(new PreviewCourseQuery(token));
  }

  @Post(':id/preview-token')
  @UseGuards(JwtAuthGuard)
  async createPreviewToken(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<{ token: string }> {
    return this.commandBus.execute(new CreatePreviewTokenCommand(user, id));
  }

  @Get(':slug')
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<CourseDetailResponseDto> {
    return this.queryBus.execute<GetCourseBySlugQuery, CourseDetailResponseDto>(
      new GetCourseBySlugQuery(slug),
    );
  }

  @Get('id/:id')
  async findById(@Param('id') id: string): Promise<CourseDetailResponseDto> {
    return this.queryBus.execute<GetCourseByIdQuery, CourseDetailResponseDto>(
      new GetCourseByIdQuery(id),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('thumbnail'))
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateCourseDto,
    @UploadedFile() thumbnail: Express.Multer.File,
  ): Promise<Course> {
    return this.commandBus.execute<CreateCourseCommand, Course>(
      new CreateCourseCommand(
        Number(user.id),
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
  ): Promise<Course> {
    return this.commandBus.execute<UpdateCourseCommand, Course>(
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

  @Post(':id/clone')
  async clone(
    @CurrentUser('id') instructorId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Course> {
    return this.commandBus.execute(new CloneCourseCommand(id, instructorId));
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.commandBus.execute(
      new ApproveCourseCommand(id, Number(user.id)),
    );
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() body: { reason?: string },
  ): Promise<void> {
    return this.commandBus.execute(
      new RejectCourseCommand(id, Number(user.id), body.reason),
    );
  }

  @Post(':id/cancel-review')
  async cancelReview(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commandBus.execute(new CancelReviewCourseCommand(id));
  }

  @Post(':id/view')
  async recordView(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<void> {
    const userId = req.user?.id ?? null;
    const ipAddress = req.ip ?? null;
    const userAgent = req.headers?.['user-agent'] ?? null;

    const view = this.courseViewRepo.create({
      courseId: id,
      userId: userId ? Number(userId) : null,
      ipAddress,
      userAgent,
    });
    await this.courseViewRepo.save(view);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commandBus.execute<DeleteCourseCommand, void>(
      new DeleteCourseCommand(id),
    );
  }
}
