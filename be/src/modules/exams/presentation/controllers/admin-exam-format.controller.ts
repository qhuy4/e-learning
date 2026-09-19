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
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import {
  IExamFormatRepository,
  EXAM_FORMAT_REPOSITORY,
} from '../../domain/repository/exam-format.repository';
import {
  IExamFormatSectionRepository,
  EXAM_FORMAT_SECTION_REPOSITORY,
} from '../../domain/repository/exam-format-section.repository';
import { ExamFormat } from '../../domain/entity/exam-format.entity';
import { ExamFormatSection } from '../../domain/entity/exam-format-section.entity';
import { CreateExamFormatDto } from '../dto/create-exam-format.dto';
import { UpdateExamFormatDto } from '../dto/update-exam-format.dto';

@Controller('admin/exam-formats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminExamFormatController {
  constructor(
    @Inject(EXAM_FORMAT_REPOSITORY)
    private readonly examFormatRepo: IExamFormatRepository,
    @Inject(EXAM_FORMAT_SECTION_REPOSITORY)
    private readonly examFormatSectionRepo: IExamFormatSectionRepository,
  ) {}

  @Post()
  async create(@Body() dto: CreateExamFormatDto) {
    const format = ExamFormat.create({
      examTypeId: dto.examTypeId,
      code: dto.code,
      name: dto.name,
      version: dto.version ? Number(dto.version) : undefined,
      description: dto.description,
      durationSeconds: dto.durationSeconds ?? 0,
      isActive: dto.isActive,
      effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
    });

    const savedFormat = await this.examFormatRepo.create(format);

    if (dto.sections && dto.sections.length > 0) {
      const sections = dto.sections.map((s) =>
        ExamFormatSection.create({
          examFormatId: savedFormat.id!,
          code: s.code,
          name: s.name,
          description: s.description,
          instructions: s.instructions,
          position: s.position,
          durationSeconds: s.durationSeconds ?? 0,
          questionCount: s.questionCount,
        }),
      );
      await this.examFormatSectionRepo.saveAll(sections);
    }

    return savedFormat;
  }

  @Get()
  async findAll() {
    return this.examFormatRepo.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entity = await this.examFormatRepo.findById(id);
    if (!entity) {
      throw new NotFoundException('ExamFormat not found');
    }
    return entity;
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamFormatDto,
  ) {
    const existing = await this.examFormatRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('ExamFormat not found');
    }
    const entity = ExamFormat.create({
      examTypeId: existing.examTypeId,
      code: dto.code ?? existing.code,
      name: dto.name ?? existing.name,
      version: dto.version !== undefined ? Number(dto.version) : existing.version,
      description: dto.description ?? existing.description,
      durationSeconds: dto.durationSeconds ?? existing.durationSeconds,
      isActive: dto.isActive ?? existing.isActive,
      effectiveFrom:
        dto.effectiveFrom !== undefined
          ? new Date(dto.effectiveFrom)
          : existing.effectiveFrom,
      effectiveTo:
        dto.effectiveTo !== undefined
          ? new Date(dto.effectiveTo)
          : existing.effectiveTo,
    });
    entity.id = id;
    return this.examFormatRepo.update(entity);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.examFormatRepo.delete(id);
  }
}
