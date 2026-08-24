import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus } from '@nestjs/cqrs';

import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

import { CreateLessonCommand } from '../application/command/create-lesson.command';
import { UpdateLessonCommand } from '../application/command/update-lesson.command';
import { DeleteLessonCommand } from '../application/command/delete-lesson.command';

@Controller('sections/:sectionId/lessons')
export class LessonController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseInterceptors(FileInterceptor('video'))
  create(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateLessonDto,
    @UploadedFile() video?: Express.Multer.File,
  ) {
    return this.commandBus.execute(
      new CreateLessonCommand(
        sectionId,
        dto.title,
        dto.type,
        dto.videoProvider,
        dto.videoSource,
        dto.duration,
        dto.content,
        dto.position,
        dto.isPreview,
        video,
      ),
    );
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLessonDto) {
    return this.commandBus.execute(new UpdateLessonCommand(id, dto));
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteLessonCommand(id));
  }
}
