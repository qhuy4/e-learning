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
      code: dto.code,
      name: dto.name,
      description: dto.description,
    });
    return this.examTypeRepo.create(entity);
  }

  @Get()
  async findAll() {
    return this.examTypeRepo.findAll();
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
      code: dto.code ?? existing.code,
      name: dto.name ?? existing.name,
      description: dto.description ?? existing.description,
    });
    entity.id = id;
    return this.examTypeRepo.update(entity);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.examTypeRepo.delete(id);
  }
}
