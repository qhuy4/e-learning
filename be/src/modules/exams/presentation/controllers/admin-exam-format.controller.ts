import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
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
import { CreateExamFormatSectionDto } from '../dto/create-exam-format.dto';

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
      name: dto.name,
      version: dto.version ? Number(dto.version) : undefined,
      description: dto.description,
      durationSeconds: dto.durationSeconds || null,
      isActive: dto.isActive,
      effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
    });

    const savedFormat = await this.examFormatRepo.create(format);

    if (dto.sections && dto.sections.length > 0) {
      const sections = dto.sections.map((s) =>
        ExamFormatSection.create({
          examFormatId: savedFormat.id!,
          name: s.name,
          description: s.description,
          instructions: s.instructions,
          position: s.position,
          durationSeconds: s.durationSeconds || null,
          questionCount: s.questionCount,
          sectionType: s.sectionType ?? null,
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

  /** Danh sách định dạng đề đã xóa mềm — trang "Đã xóa" (đặt trước @Get(':id')). */
  @Get('deleted')
  async findDeleted() {
    return this.examFormatRepo.findDeleted();
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

  /**
   * Xóa định dạng đề — mặc định XÓA MỀM: chỉ set `exam_formats.deleted_at`,
   * đề thi liên quan giữ nguyên nhưng bị ẩn khỏi danh sách active cho tới khi
   * khôi phục. `?force=1` → xóa cứng (dọn dữ liệu test; bị chặn FK nếu còn
   * đề thi trỏ tới định dạng này).
   */
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('force') force?: string,
  ) {
    if (force === '1' || force === 'true') {
      return this.examFormatRepo.delete(id);
    }
    const existing = await this.examFormatRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('ExamFormat not found');
    }
    await this.examFormatRepo.softDelete(id);
  }

  /**
   * Khôi phục định dạng đề đã xóa mềm — các đề THUỘC ĐỊNH DẠNG NÀY chưa bị
   * xóa riêng (và loại đề còn active) sẽ hiển thị lại trong danh sách active.
   */
  @Post(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    const existing = await this.examFormatRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('ExamFormat not found');
    }
    await this.examFormatRepo.restore(id);
    return this.examFormatRepo.findById(id);
  }

  @Get(':formatId/sections')
  async findSections(@Param('formatId', ParseIntPipe) formatId: number) {
    return this.examFormatSectionRepo.findByExamFormatId(formatId);
  }

  @Post(':formatId/sections')
  async createSection(
    @Param('formatId', ParseIntPipe) formatId: number,
    @Body() dto: CreateExamFormatSectionDto,
  ) {
    const section = ExamFormatSection.create({
      examFormatId: formatId,
      name: dto.name,
      description: dto.description,
      instructions: dto.instructions,
      position: dto.position,
      durationSeconds: dto.durationSeconds || null,
      questionCount: dto.questionCount,
      sectionType: dto.sectionType ?? null,
    });
    return this.examFormatSectionRepo.save(section);
  }

  @Put('sections/:sectionId')
  async updateSection(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: Partial<CreateExamFormatSectionDto>,
  ) {
    const existing = await this.examFormatSectionRepo.findById(sectionId);
    if (!existing) {
      throw new NotFoundException('ExamFormatSection not found');
    }
    existing.update({
      name: dto.name,
      description: dto.description,
      instructions: dto.instructions,
      position: dto.position,
      durationSeconds: dto.durationSeconds,
      questionCount: dto.questionCount,
      sectionType: dto.sectionType,
    });
    return this.examFormatSectionRepo.save(existing);
  }

  @Delete('sections/:sectionId')
  async removeSection(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.examFormatSectionRepo.delete(sectionId);
  }
}
