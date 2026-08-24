import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CommandBus } from '@nestjs/cqrs';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

import { CreateSectionCommand } from './../application/command/create-section.command';
import { UpdateSectionCommand } from './../application/command/update-section.command';
import { DeleteSectionCommand } from './../application/command/delete-section.command';

@Controller('courses/:courseId/sections')
export class SectionController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateSectionDto,
  ) {
    return this.commandBus.execute(
      new CreateSectionCommand(
        courseId,
        dto.title,
        dto.description,
        dto.position,
        dto.isActive,
      ),
    );
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSectionDto) {
    return this.commandBus.execute(new UpdateSectionCommand(id, dto));
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteSectionCommand(id));
  }
}
