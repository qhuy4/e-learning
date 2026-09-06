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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryBus, CommandBus } from '@nestjs/cqrs';

import { GetCoursesDto } from './dto/get-courses.dto';
import { GetCoursesQuery } from '../application/query/get-courses.query';
import { GetAdminCoursesQuery } from '../application/query/get-admin-courses.query';
import { GetCourseBySlugQuery } from '../application/query/get-course-by-slug.query';
import { GetCourseByIdQuery } from '../application/query/get-course-by-id.query';

import { CourseResponseDto } from './dto/course-response.dto';
import { CourseDetailResponseDto } from './dto/course-detail-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

import { CreateCourseCommand } from '../application/command/create-course.command';
import { UpdateCourseCommand } from '../application/command/update-course.command';
import { DeleteCourseCommand } from '../application/command/delete-course.command';

import { Course } from '../domain/entity/course.entity';
import { CloneCourseCommand } from '../application/command/clone-course.command';
import { ApproveCourseCommand } from '../application/command/approve-course.command';
import { RejectCourseCommand } from '../application/command/reject-course.command';
import { CancelReviewCourseCommand } from '../application/command/cancel-review-course.command';
import { CreatePreviewTokenCommand } from '../application/command/create-preview-token.command';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/domain/entity/user.entity';
import { PreviewCourseQuery } from '../application/query/preview-course.query';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
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
      new GetAdminCoursesQuery(
        query.page ?? 1,
        query.limit ?? 10,
        query.level,
        query.keyword,
        query.status,
      ),
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
  async clone(@Param('id', ParseIntPipe) id: number): Promise<Course> {
    return this.commandBus.execute(new CloneCourseCommand(id));
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

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commandBus.execute<DeleteCourseCommand, void>(
      new DeleteCourseCommand(id),
    );
  }
}
