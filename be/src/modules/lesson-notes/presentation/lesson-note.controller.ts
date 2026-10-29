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
import { CreateLessonNoteCommand } from '../application/command/create-lesson-note.command';
import { UpdateLessonNoteCommand } from '../application/command/update-lesson-note.command';
import { DeleteLessonNoteCommand } from '../application/command/delete-lesson-note.command';
import { GetLessonNotesQuery } from '../application/query/get-lesson-notes.query';
import { CreateLessonNoteDto } from './dto/create-lesson-note.dto';
import { UpdateLessonNoteDto } from './dto/update-lesson-note.dto';
import { LessonNote } from '../domain/entity/lesson-note.entity';

@Controller('lesson-notes')
@UseGuards(JwtAuthGuard)
export class LessonNoteController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('lesson/:lessonId')
  async getLessonNotes(
    @CurrentUser('id') userId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ): Promise<LessonNote[]> {
    return this.queryBus.execute(new GetLessonNotesQuery(userId, lessonId));
  }

  @Post()
  async createLessonNote(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateLessonNoteDto,
  ): Promise<LessonNote> {
    return this.commandBus.execute(
      new CreateLessonNoteCommand(
        userId,
        dto.lessonId,
        dto.noteTimeSeconds,
        dto.content,
      ),
    );
  }

  @Patch(':id')
  async updateLessonNote(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonNoteDto,
  ): Promise<LessonNote> {
    return this.commandBus.execute(
      new UpdateLessonNoteCommand(userId, id, dto.content),
    );
  }

  @Delete(':id')
  async deleteLessonNote(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true }> {
    return this.commandBus.execute(new DeleteLessonNoteCommand(userId, id));
  }
}
