import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { GetAdminQuestionsQuery } from '@/modules/course-questions/application/query/get-admin-questions.query';
import { GetAdminQuestionDetailQuery } from '@/modules/course-questions/application/query/get-admin-question-detail.query';
import { UpdateQuestionStatusCommand } from '@/modules/course-questions/application/command/update-question-status.command';
import { UpdateAnswerStatusCommand } from '@/modules/course-questions/application/command/update-answer-status.command';
import { DeleteQuestionCommand } from '@/modules/course-questions/application/command/delete-question.command';
import { DeleteAnswerCommand } from '@/modules/course-questions/application/command/delete-answer.command';
import { UpdateStatusDto } from '@/modules/course-questions/presentation/dto/update-status.dto';
import { AdminQuestionResponseMapper } from '@/modules/course-questions/presentation/mapper/admin-question-response.mapper';
import { AdminQuestionsPage } from '@/modules/course-questions/domain/repository/course-question.repository';
import { CourseQuestion } from '@/modules/course-questions/domain/entity/course-question.entity';

@Controller('admin/course-questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminCourseQuestionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('courseId') courseId?: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.queryBus.execute<
      GetAdminQuestionsQuery,
      AdminQuestionsPage
    >(
      new GetAdminQuestionsQuery({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        courseId: courseId ? parseInt(courseId, 10) : undefined,
        status: status !== undefined ? parseInt(status, 10) : undefined,
        keyword,
        sortBy,
        sortOrder,
      }),
    );

    return {
      data: result.data.map((q) => AdminQuestionResponseMapper.toResponse(q)),
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const question = await this.queryBus.execute<
      GetAdminQuestionDetailQuery,
      CourseQuestion
    >(new GetAdminQuestionDetailQuery({ id }));
    return AdminQuestionResponseMapper.toResponse(question);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    const question = await this.commandBus.execute<
      UpdateQuestionStatusCommand,
      CourseQuestion
    >(new UpdateQuestionStatusCommand({ id, status: dto.status }));
    return AdminQuestionResponseMapper.toResponse(question);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.commandBus.execute(new DeleteQuestionCommand({ id }));
  }

  @Patch('answers/:id/status')
  async updateAnswerStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    await this.commandBus.execute(
      new UpdateAnswerStatusCommand({ id, status: dto.status }),
    );
  }

  @Delete('answers/:id')
  async removeAnswer(@Param('id', ParseIntPipe) id: number) {
    await this.commandBus.execute(new DeleteAnswerCommand({ id }));
  }
}
