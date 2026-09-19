import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  IExamMaterialRepository,
  EXAM_MATERIAL_REPOSITORY,
} from '../../domain/repository/exam-material.repository';
import { ExamMaterial } from '../../domain/entity/exam-material.entity';
import { UpdateExamMaterialDto } from '../dto/update-exam-material.dto';

@Controller('admin/exam-materials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminExamMaterialController {
  constructor(
    @Inject(EXAM_MATERIAL_REPOSITORY)
    private readonly examMaterialRepo: IExamMaterialRepository,
  ) {}

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamMaterialDto,
    @CurrentUser('id') userId: number,
  ) {
    const existing = await this.examMaterialRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('ExamMaterial not found');
    }
    const entity = ExamMaterial.create({
      sectionId: existing.sectionId,
      type: dto.type ?? existing.type,
      title: dto.title ?? existing.title,
      content: dto.content ?? existing.content,
      fileUrl: dto.fileUrl ?? existing.fileUrl,
      transcript: dto.transcript ?? existing.transcript,
      position: dto.position ?? existing.position,
    });
    entity.id = id;
    return this.examMaterialRepo.save(entity);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.examMaterialRepo.delete(id);
  }
}
