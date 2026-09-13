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
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

import { GetInstructorCoursesQuery } from '@/modules/courses/application/query/get-instructor-courses.query';
import { GetCourseByIdQuery } from '@/modules/courses/application/query/get-course-by-id.query';
import { CreateCourseCommand } from '@/modules/courses/application/command/create-course.command';
import { UpdateCourseCommand } from '@/modules/courses/application/command/update-course.command';
import { DeleteCourseCommand } from '@/modules/courses/application/command/delete-course.command';
import { CloneCourseCommand } from '@/modules/courses/application/command/clone-course.command';

import { CreateCourseDto } from '@/modules/courses/presentation/dto/create-course.dto';
import { UpdateCourseDto } from '@/modules/courses/presentation/dto/update-course.dto';

@UseGuards(JwtAuthGuard)
@Controller('instructor/courses')
export class InstructorCoursesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async findAll(
    @CurrentUser('id') instructorId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('level') level?: number,
    @Query('keyword') keyword?: string,
    @Query('status') status?: number,
  ) {
    return this.queryBus.execute(
      new GetInstructorCoursesQuery(
        instructorId,
        page ?? 1,
        limit ?? 10,
        level,
        keyword,
        status,
      ),
    );
  }

  @Get(':id')
  async findOne(
    @CurrentUser('id') instructorId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.queryBus.execute(new GetCourseByIdQuery(id.toString()));
  }

  @Post()
  @UseInterceptors(FileInterceptor('thumbnail'))
  async create(
    @CurrentUser('id') instructorId: number,
    @Body() dto: CreateCourseDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ) {
    return this.commandBus.execute(
      new CreateCourseCommand(
        instructorId,
        dto.title,
        dto.description,
        thumbnail,
        dto.level,
        dto.price,
        dto.parentId,
        dto.categories,
      ),
    );
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('thumbnail'))
  async update(
    @CurrentUser('id') instructorId: number,
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
        categories: dto.categories,
      }),
    );
  }

  @Post(':id/clone')
  async clone(
    @CurrentUser('id') instructorId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commandBus.execute(new CloneCourseCommand(id, instructorId));
  }

  @Delete(':id')
  async remove(
    @CurrentUser('id') instructorId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commandBus.execute(new DeleteCourseCommand(id));
  }
}
