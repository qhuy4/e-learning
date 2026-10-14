import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
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
  IExamTypeRepository,
  EXAM_TYPE_REPOSITORY,
} from '../../domain/repository/exam-type.repository';
import { ExamType } from '../../domain/entity/exam-type.entity';
import { CreateExamTypeDto } from '../dto/create-exam-type.dto';
import { UpdateExamTypeDto } from '../dto/update-exam-type.dto';

@Controller('admin/exam-types')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminExamTypeController {
  constructor(
    @Inject(EXAM_TYPE_REPOSITORY)
    private readonly examTypeRepo: IExamTypeRepository,
  ) {}

  @Post()
  async create(@Body() dto: CreateExamTypeDto) {
    const entity = ExamType.create({
      name: dto.name,
      description: dto.description,
    });
    return this.examTypeRepo.create(entity);
  }

  @Get()
  async findAll() {
    return this.examTypeRepo.findAll();
  }

  /** Danh sách loại đề đã xóa mềm — trang "Đã xóa" (đặt trước @Get(':id')). */
  @Get('deleted')
  async findDeleted() {
    return this.examTypeRepo.findDeleted();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entity = await this.examTypeRepo.findById(id);
    if (!entity) {
      throw new NotFoundException('ExamType not found');
    }
    return entity;
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamTypeDto,
  ) {
    const existing = await this.examTypeRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('ExamType not found');
    }
    const entity = ExamType.create({
      name: dto.name ?? existing.name,
      description: dto.description ?? existing.description,
    });
    entity.id = id;
    return this.examTypeRepo.update(entity);
  }

  /**
   * Xóa loại đề — mặc định XÓA MỀM: chỉ set `exam_types.deleted_at`, dữ liệu
   * đề thi liên quan giữ nguyên; các đề thuộc loại này bị ẩn khỏi danh sách
   * active cho tới khi khôi phục. `?force=1` → xóa cứng (dọn dữ liệu test).
   */
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('force') force?: string,
  ) {
    if (force === '1' || force === 'true') {
      return this.examTypeRepo.delete(id);
    }
    const existing = await this.examTypeRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('ExamType not found');
    }
    await this.examTypeRepo.softDelete(id);
  }

  /**
   * Khôi phục loại đề đã xóa mềm — các đề THUỘC LOẠI NÀY chưa bị xóa riêng
   * sẽ hiển thị lại trong danh sách active ngay lập tức.
   */
  @Post(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    const existing = await this.examTypeRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('ExamType not found');
    }
    await this.examTypeRepo.restore(id);
    return this.examTypeRepo.findById(id);
  }
}
