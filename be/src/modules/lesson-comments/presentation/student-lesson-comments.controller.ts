import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateLessonCommentCommand } from '../application/command/create-lesson-comment.command';
import { UpdateLessonCommentCommand } from '../application/command/update-lesson-comment.command';
import { DeleteLessonCommentCommand } from '../application/command/delete-lesson-comment.command';
import { GetLessonCommentsQuery } from '../application/query/get-lesson-comments.query';
import { CreateLessonCommentDto } from './dto/create-lesson-comment.dto';
import { UpdateLessonCommentDto } from './dto/update-lesson-comment.dto';
import { LessonCommentResponse } from '../application/query-handler/get-lesson-comments.handler';

@Controller('lesson-comments')
@UseGuards(JwtAuthGuard)
export class StudentLessonCommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('lesson/:lessonId')
  async getLessonComments(
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ): Promise<LessonCommentResponse[]> {
    // Danh sách phẳng, FE tự dựng cây nhiều cấp theo parentId.
    return this.queryBus.execute(new GetLessonCommentsQuery(lessonId));
  }

  @Post()
  async createComment(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateLessonCommentDto,
  ) {
    return this.commandBus.execute(
      new CreateLessonCommentCommand(
        userId,
        dto.lessonId,
        dto.content,
        dto.parentId ?? null,
      ),
    );
  }

  @Patch(':id')
  async updateComment(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonCommentDto,
  ) {
    return this.commandBus.execute(
      new UpdateLessonCommentCommand(userId, id, dto.content),
    );
  }

  @Delete(':id')
  async deleteComment(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true }> {
    return this.commandBus.execute(new DeleteLessonCommentCommand(userId, id));
  }
}
