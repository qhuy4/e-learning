import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Inject,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import {
  IExamGroupMaterialRepository,
  EXAM_GROUP_MATERIAL_REPOSITORY,
} from '../../domain/repository/exam-group-material.repository';
import { ExamGroupMaterial } from '../../domain/entity/exam-group-material.entity';
import { CreateExamGroupMaterialDto, UpdateExamGroupMaterialDto } from '../dto/create-exam-group-material.dto';
import { FILE_STORAGE, FileStorage } from '@/common/storage/domain/interface/file-storage.interface';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Controller('admin/exam-group-materials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminExamGroupMaterialController {
  constructor(
    @Inject(EXAM_GROUP_MATERIAL_REPOSITORY)
    private readonly materialRepo: IExamGroupMaterialRepository,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  @Get('group/:groupId')
  async findByGroup(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.materialRepo.findByGroupId(groupId);
  }

  @Post('group/:groupId')
  async create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateExamGroupMaterialDto,
  ) {
    const material = ExamGroupMaterial.create({
      groupId,
      type: dto.type,
      title: dto.title,
      content: dto.content,
      fileUrl: dto.fileUrl,
      transcript: dto.transcript,
      position: dto.position ?? 0,
    });
    return this.materialRepo.save(material);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamGroupMaterialDto,
  ) {
    const existing = await this.materialRepo.findById(id);
    if (!existing) throw new BadRequestException('Material not found');
    existing.update(dto);
    return this.materialRepo.save(existing);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.materialRepo.delete(id);
    return { success: true };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui long chon file');
    }

    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-m4a', 'audio/mp4',
      'image/png', 'image/jpeg', 'image/webp', 'image/gif',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Loai file khong hop le');
    }

    const extension = extname(file.originalname).toLowerCase();
    const folder = file.mimetype.startsWith('audio/') ? 'exams/audio' :
                   file.mimetype.startsWith('image/') ? 'exams/images' : 'exams/files';
    const key = `${folder}/${randomUUID()}${extension}`;

    await this.storage.upload({
      key,
      body: file.buffer,
      contentType: file.mimetype,
      contentLength: file.size,
    });

    const url = this.storage.getPublicUrl(key) ?? `/storage/${key}`;
    return { url, key, originalName: file.originalname };
  }
}
