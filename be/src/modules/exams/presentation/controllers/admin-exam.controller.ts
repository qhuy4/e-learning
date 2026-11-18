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
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  IExamRepository,
  EXAM_REPOSITORY,
} from '../../domain/repository/exam.repository';
import {
  IExamFormatRepository,
  EXAM_FORMAT_REPOSITORY,
} from '../../domain/repository/exam-format.repository';
import {
  IExamFormatSectionRepository,
  EXAM_FORMAT_SECTION_REPOSITORY,
} from '../../domain/repository/exam-format-section.repository';
import {
  IExamSectionRepository,
  EXAM_SECTION_REPOSITORY,
} from '../../domain/repository/exam-section.repository';
import {
  IExamQuestionGroupRepository,
  EXAM_QUESTION_GROUP_REPOSITORY,
} from '../../domain/repository/exam-question-group.repository';
import {
  IExamQuestionRepository,
  EXAM_QUESTION_REPOSITORY,
} from '../../domain/repository/exam-question.repository';
import { Exam } from '../../domain/entity/exam.entity';
import { ExamStatus } from '../../domain/enums/exam-status.enum';
import { ExamSection } from '../../domain/entity/exam-section.entity';
import { CreateExamDto } from '../dto/create-exam.dto';
import { UpdateExamDto } from '../dto/update-exam.dto';
import { GetExamDetailQuery } from '../../application/query/get-exam-detail.query';
import { QueryBus } from '@nestjs/cqrs';

@Controller('admin/exams')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminExamController {
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
    @Inject(EXAM_FORMAT_REPOSITORY)
    private readonly examFormatRepo: IExamFormatRepository,
    @Inject(EXAM_FORMAT_SECTION_REPOSITORY)
    private readonly examFormatSectionRepo: IExamFormatSectionRepository,
    @Inject(EXAM_SECTION_REPOSITORY)
    private readonly examSectionRepo: IExamSectionRepository,
    @Inject(EXAM_QUESTION_GROUP_REPOSITORY)
    private readonly groupRepo: IExamQuestionGroupRepository,
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly questionRepo: IExamQuestionRepository,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateExamDto, @CurrentUser('id') userId: number) {
    const format = await this.examFormatRepo.findById(dto.examFormatId);
    if (!format) {
      throw new NotFoundException('ExamFormat not found');
    }

    const exam = Exam.create({
      examFormatId: dto.examFormatId,
      title: dto.title,
      description: dto.description,
      isPremium: dto.isPremium,
      durationSeconds: dto.durationSeconds ?? format.durationSeconds,
      createdBy: userId,
    });

    const savedExam = await this.examRepo.create(exam);

    const formatSections = await this.examFormatSectionRepo.findByExamFormatId(
      dto.examFormatId,
    );

    if (formatSections.length > 0) {
      const sections = formatSections.map((fs) =>
        ExamSection.create({
          examId: savedExam.id!,
          formatSectionId: fs.id!,
          name: fs.name,
          instructions: fs.instructions,
          position: fs.position,
          durationSeconds: fs.durationSeconds,
          questionCount: fs.questionCount,
          // Kỹ năng lấy từ format — gen đề KHÔNG đoán qua tên section.
          sectionType: fs.sectionType,
        }),
      );
      await this.examSectionRepo.saveAll(sections);
    }

    const sections = await this.examSectionRepo.findByExamId(savedExam.id!);

    return { ...savedExam, sections };
  }

  @Get()
  async findAll() {
    return this.examRepo.findAll();
  }

  /**
   * Danh sách đề đã xóa mềm — trang "Đã xóa" của admin.
   * (KHÔNG được đặt sau @Get(':id') — nếu không route ":id" sẽ bắt trước.)
   */
  @Get('deleted')
  async findDeleted() {
    return this.examRepo.findDeleted();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const exam = await this.examRepo.findById(id);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    const sections = await this.examSectionRepo.findByExamId(id);
    return { ...exam, sections };
  }

  @Get(':id/detail')
  async findDetail(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetExamDetailQuery(id));
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamDto,
  ) {
    const existing = await this.examRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Exam not found');
    }
    const entity = Exam.create({
      examFormatId: existing.examFormatId,
      title: dto.title ?? existing.title,
      description: dto.description ?? existing.description,
      isPremium: dto.isPremium ?? existing.isPremium,
      durationSeconds: dto.durationSeconds ?? existing.durationSeconds,
      createdBy: existing.createdBy,
    });
    entity.id = id;
    return this.examRepo.update(entity);
  }

  /**
   * Xóa đề thi — mặc định XÓA MỀM: chỉ set `exams.deleted_at`, toàn bộ dữ liệu
   * liên quan (sections/questions/options/media, exam_attempts, exam_answers)
   * giữ nguyên 100%. `?force=1` → xóa cứng, CHỈ dùng cho dọn dữ liệu test.
   */
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('force') force?: string,
  ) {
    if (force === '1' || force === 'true') {
      return this.examRepo.delete(id);
    }
    const existing = await this.examRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Exam not found');
    }
    await this.examRepo.softDelete(id);
  }

  /**
   * Khôi phục đề đã xóa mềm (đưa `deleted_at` về null). Danh sách active chỉ
   * hiển thị lại khi loại đề (exam_types) cũng đang active.
   */
  @Post(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    const existing = await this.examRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Exam not found');
    }
    await this.examRepo.restore(id);
    return this.examRepo.findById(id);
  }

  /**
   * Sao chép toàn bộ đề thi (sections/groups/materials/questions/options)
   * thành 1 đề mới DRAFT — copy chạy trong 1 transaction.
   */
  @Post(':id/duplicate')
  async duplicate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    const existing = await this.examRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Exam not found');
    }

    const copy = await this.examRepo.duplicate(id, {
      title: `${existing.title} (Bản sao)`,
      createdBy: userId,
    });
    if (!copy || copy.id === null) {
      throw new NotFoundException('Exam not found');
    }

    const sections = await this.examSectionRepo.findByExamId(copy.id);
    return { ...copy, sections };
  }

  @Put(':id/publish')
  async publish(@Param('id', ParseIntPipe) id: number) {
    const existing = await this.examRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Exam not found');
    }

    const sections = await this.examSectionRepo.findByExamId(id);
    for (const section of sections) {
      const questionCount = await this.questionRepo.countBySectionId(
        section.id!,
      );
      if (questionCount !== section.questionCount) {
        throw new BadRequestException(
          `Section "${section.name}" có ${questionCount} câu hỏi, cần ${section.questionCount} câu hỏi theo cấu trúc. Vui lòng kiểm tra lại.`,
        );
      }
    }

    existing.update({ status: ExamStatus.PUBLISHED });
    return this.examRepo.update(existing);
  }

  @Put(':id/archive')
  async archive(@Param('id', ParseIntPipe) id: number) {
    const existing = await this.examRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Exam not found');
    }
    existing.update({ status: ExamStatus.ARCHIVED });
    return this.examRepo.update(existing);
  }

  @Get(':examId/sections')
  async getSections(@Param('examId', ParseIntPipe) examId: number) {
    return this.examSectionRepo.findByExamId(examId);
  }
}
