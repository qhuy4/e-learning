import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { ExamOrmEntity } from '../entity/exam.orm-entity';
import { ExamSectionOrmEntity } from '../entity/exam-section.orm-entity';
import { ExamQuestionGroupOrmEntity } from '../entity/exam-question-group.orm-entity';
import { ExamGroupMaterialOrmEntity } from '../entity/exam-group-material.orm-entity';
import { ExamQuestionOrmEntity } from '../entity/exam-question.orm-entity';
import { ExamOptionOrmEntity } from '../entity/exam-option.orm-entity';
import { Exam } from '../../domain/entity/exam.entity';
import {
  IExamRepository,
  ExamWithTypeName,
} from '../../domain/repository/exam.repository';
import { ExamMapper } from '../mapper/exam.mapper';
import { ExamStatus } from '../../domain/enums/exam-status.enum';

@Injectable()
export class ExamRepository implements IExamRepository {
  constructor(
    @InjectRepository(ExamOrmEntity)
    private readonly repository: Repository<ExamOrmEntity>,
  ) {}

  async findById(id: number): Promise<Exam | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? ExamMapper.toDomain(entity) : null;
  }

  /** Single exam (must exist) with `examTypeName` + `examFormatName` via exam_formats -> exam_types. */
  async findByIdWithTypeName(id: number): Promise<ExamWithTypeName | null> {
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
      relations: { examFormat: { examType: true } },
    });
    if (!entity) return null;
    const exam = ExamMapper.toDomain(entity) as ExamWithTypeName;
    exam.examTypeName = entity.examFormat?.examType?.name ?? null;
    exam.examFormatName = entity.examFormat?.name ?? null;
    return exam;
  }

  async findByStatus(status: string): Promise<Exam[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => ExamMapper.toDomain(entity));
  }

  /** Published exams for the student listing, each with `examTypeName` + `examFormatName`. */
  async findPublishedWithTypeName(): Promise<ExamWithTypeName[]> {
    const entities = await this.repository.find({
      where: {
        status: ExamStatus.PUBLISHED,
        // Đề đã xóa mềm, hoặc thuộc loại đề / định dạng đề đã xóa → không hiển thị cho học viên.
        deletedAt: IsNull(),
        examFormat: { deletedAt: IsNull(), examType: { deletedAt: IsNull() } },
      },
      relations: { examFormat: { examType: true } },
      order: { id: 'ASC' },
    });
    return entities.map((entity) => {
      const exam = ExamMapper.toDomain(entity) as ExamWithTypeName;
      exam.examTypeName = entity.examFormat?.examType?.name ?? null;
      exam.examFormatName = entity.examFormat?.name ?? null;
      return exam;
    });
  }

  async findByCreatedBy(createdBy: number): Promise<Exam[]> {
    const entities = await this.repository.find({ where: { createdBy: createdBy.toString() } });
    return entities.map((entity) => ExamMapper.toDomain(entity));
  }

  /**
   * Danh sách active: exam chưa xóa mềm VÀ định dạng đề + loại đề (exam_formats → exam_types)
   * chưa xóa mềm — xóa định dạng / loại đề thì các đề liên quan cũng ẩn theo.
   */
  async findAll(): Promise<Exam[]> {
    const entities = await this.repository.find({
      where: {
        deletedAt: IsNull(),
        examFormat: { deletedAt: IsNull(), examType: { deletedAt: IsNull() } },
      },
      relations: { examFormat: { examType: true } },
      order: { id: 'ASC' },
    });
    return entities.map((entity) => ExamMapper.toDomain(entity));
  }

  /** Đề đã xóa mềm — trang "Đã xóa" của admin (mới xóa lên trước). */
  async findDeleted(): Promise<Exam[]> {
    const entities = await this.repository.find({
      where: { deletedAt: Not(IsNull()) },
      order: { deletedAt: 'DESC' },
    });
    return entities.map((entity) => ExamMapper.toDomain(entity));
  }

  /** Xóa mềm: chỉ set deleted_at — sections/questions/attempts/answers giữ nguyên. */
  async softDelete(id: number): Promise<void> {
    await this.repository.update({ id: id.toString() }, { deletedAt: new Date() });
  }

  /** Bỏ cờ xóa mềm — đề chỉ hiển thị lại ở danh sách active nếu loại đề đang active. */
  async restore(id: number): Promise<void> {
    await this.repository.update({ id: id.toString() }, { deletedAt: null });
  }

  async create(exam: Exam): Promise<Exam> {
    const entity = this.repository.create({
      examFormatId: exam.examFormatId.toString(),
      title: exam.title,
      description: exam.description,
      isPremium: exam.isPremium,
      durationSeconds: exam.durationSeconds,
      status: exam.status,
      createdBy: exam.createdBy ? exam.createdBy.toString() : null,
      publishedAt: exam.publishedAt,
    });
    const saved = await this.repository.save(entity);
    return ExamMapper.toDomain(saved);
  }

  async update(exam: Exam): Promise<Exam> {
    const entity = await this.repository.preload({
      id: exam.id!.toString(),
      examFormatId: exam.examFormatId.toString(),
      title: exam.title,
      description: exam.description,
      isPremium: exam.isPremium,
      durationSeconds: exam.durationSeconds,
      status: exam.status,
      createdBy: exam.createdBy ? exam.createdBy.toString() : null,
      publishedAt: exam.publishedAt,
    });
    if (!entity) throw new Error('Exam not found');
    const saved = await this.repository.save(entity);
    return ExamMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Sao chép 1 đề thi INSIDE một transaction: exam → sections → groups →
   * materials → questions (direct + trong group) → options. Bản sao là DRAFT,
   * không có attempts/answers. Trả về null nếu đề gốc không tồn tại.
   */
  async duplicate(
    id: number,
    params: { title: string; createdBy: number | null },
  ): Promise<Exam | null> {
    return this.repository.manager.transaction(async (manager) => {
      const source = await manager.findOne(ExamOrmEntity, {
        where: { id: id.toString() },
      });
      if (!source) return null;

      const exam = await manager.save(
        manager.create(ExamOrmEntity, {
          examFormatId: source.examFormatId,
          title: params.title,
          description: source.description,
          isPremium: source.isPremium,
          durationSeconds: source.durationSeconds,
          status: ExamStatus.DRAFT,
          createdBy: params.createdBy ? params.createdBy.toString() : null,
          publishedAt: null,
        }),
      );

      const copyQuestion = async (
        question: ExamQuestionOrmEntity,
        sectionId: string,
        groupId: string | null,
      ): Promise<void> => {
        const copied = await manager.save(
          manager.create(ExamQuestionOrmEntity, {
            sectionId,
            groupId,
            type: question.type,
            question: question.question,
            explanation: question.explanation,
            points: question.points,
            position: question.position,
          }),
        );
        const options = await manager.find(ExamOptionOrmEntity, {
          where: { questionId: question.id },
          order: { position: 'ASC' },
        });
        if (options.length > 0) {
          await manager.save(
            options.map((option) =>
              manager.create(ExamOptionOrmEntity, {
                questionId: copied.id,
                content: option.content,
                isCorrect: option.isCorrect,
                position: option.position,
              }),
            ),
          );
        }
      };

      const sections = await manager.find(ExamSectionOrmEntity, {
        where: { examId: source.id },
        order: { position: 'ASC' },
      });

      for (const section of sections) {
        const copiedSection = await manager.save(
          manager.create(ExamSectionOrmEntity, {
            examId: exam.id,
            formatSectionId: section.formatSectionId,
            name: section.name,
            description: section.description,
            instructions: section.instructions,
            position: section.position,
            durationSeconds: section.durationSeconds,
            questionCount: section.questionCount,
            // Kỹ năng đi theo bản sao — không cần đoán lại từ tên.
            sectionType: section.sectionType,
          }),
        );

        // Nhóm câu hỏi (hội thoại / đoạn văn) + material của từng nhóm.
        const groups = await manager.find(ExamQuestionGroupOrmEntity, {
          where: { sectionId: section.id },
          order: { position: 'ASC' },
        });
        for (const group of groups) {
          const copiedGroup = await manager.save(
            manager.create(ExamQuestionGroupOrmEntity, {
              sectionId: copiedSection.id,
              groupType: group.groupType,
              title: group.title,
              instructions: group.instructions,
              position: group.position,
            }),
          );

          const materials = await manager.find(ExamGroupMaterialOrmEntity, {
            where: { groupId: group.id },
            order: { position: 'ASC' },
          });
          if (materials.length > 0) {
            await manager.save(
              materials.map((material) =>
                manager.create(ExamGroupMaterialOrmEntity, {
                  groupId: copiedGroup.id,
                  type: material.type,
                  title: material.title,
                  content: material.content,
                  fileUrl: material.fileUrl,
                  transcript: material.transcript,
                  position: material.position,
                }),
              ),
            );
          }

          const groupQuestions = await manager.find(ExamQuestionOrmEntity, {
            where: { groupId: group.id },
            order: { position: 'ASC' },
          });
          for (const question of groupQuestions) {
            await copyQuestion(question, copiedSection.id, copiedGroup.id);
          }
        }

        // Câu hỏi trực tiếp trong section (không group) — VD Part 5 TOEIC.
        const directQuestions = await manager.find(ExamQuestionOrmEntity, {
          where: { sectionId: section.id, groupId: IsNull() },
          order: { position: 'ASC' },
        });
        for (const question of directQuestions) {
          await copyQuestion(question, copiedSection.id, null);
        }
      }

      return ExamMapper.toDomain(exam);
    });
  }
}
