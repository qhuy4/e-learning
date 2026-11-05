import { Controller, Get, Post, Delete, Put, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateDictationCommand } from '../../application/command/create-dictation.command';
import { UpdateDictationCommand } from '../../application/command/update-dictation.command';
import { DeleteDictationCommand } from '../../application/command/delete-dictation.command';
import { AttachDictationCommand } from '../../application/command/attach-dictation.command';
import { DetachDictationCommand } from '../../application/command/detach-dictation.command';
import { GetDictationByIdQuery } from '../../application/query/get-dictation-by-id.query';
import { GetMyDictationsQuery } from '../../application/query/get-my-dictations.query';
import { GetLessonDictationsQuery } from '../../application/query/get-lesson-dictations.query';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.INSTRUCTOR)
@Controller('instructor/dictations')
export class InstructorDictationController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @UseInterceptors(FileInterceptor('audio'))
  async create(
    @Body() dto: any,
    @CurrentUser('id') teacherId: number,
    @UploadedFile() audio?: Express.Multer.File,
  ) {
    const parsedDto = typeof dto.data === 'string' ? JSON.parse(dto.data) : dto;
    return this.commandBus.execute(new CreateDictationCommand(parsedDto, teacherId.toString(), audio));
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('audio'))
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('id') teacherId: number,
    @UploadedFile() audio?: Express.Multer.File,
  ) {
    const parsedDto = typeof dto.data === 'string' ? JSON.parse(dto.data) : dto;
    return this.commandBus.execute(new UpdateDictationCommand(id, teacherId.toString(), parsedDto, audio));
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') teacherId: number) {
    return this.commandBus.execute(new DeleteDictationCommand(id, teacherId.toString()));
  }

  @Get('my-dictations')
  async getMyDictations(@CurrentUser('id') teacherId: number) {
    return this.queryBus.execute(new GetMyDictationsQuery(teacherId.toString()));
  }

  @Get('lesson/:lessonId')
  async getLessonDictations(@Param('lessonId') lessonId: string) {
    return this.queryBus.execute(new GetLessonDictationsQuery(lessonId));
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.queryBus.execute(new GetDictationByIdQuery(id));
  }

  @Post(':dictationId/attach')
  async attach(@Param('dictationId') dictationId: string, @Body() dto: any, @CurrentUser('id') teacherId: number) {
    return this.commandBus.execute(new AttachDictationCommand(dictationId, dto.lessonId.toString(), teacherId.toString()));
  }

  @Delete(':dictationId/detach/:lessonId')
  async detach(@Param('dictationId') dictationId: string, @Param('lessonId') lessonId: string, @CurrentUser('id') teacherId: number) {
    return this.commandBus.execute(new DetachDictationCommand(dictationId, lessonId, teacherId.toString()));
  }
}
