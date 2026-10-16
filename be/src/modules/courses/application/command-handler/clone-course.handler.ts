import { ConflictException, ForbiddenException, HttpStatus, Inject } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CloneCourseCommand } from '../command/clone-course.command';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '../../domain/repository/course.repository';
import {
  SECTION_REPOSITORY,
  ISectionRepository,
} from '@/modules/sections/domain/repository/section.repository';
import {
  LESSON_REPOSITORY,
  ILessonRepository,
} from '@/modules/lessons/domain/repository/lesson.repository';
import { Section } from '@/modules/sections/domain/entity/section.entity';
import { Lesson } from '@/modules/lessons/domain/entity/lesson.entity';
import { SlugUtil } from '@/common/utils/slug.util';
import { Course } from '@/modules/courses/domain/entity/course.entity';
import { CourseStatus } from '@/modules/courses/domain/enum/course-status.enum';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { CategoryCourseOrmEntity } from '@/modules/categories/infrastructure/entity/category-course.orm-entity';
import { LessonMaterialOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson-material.orm-entity';
import { LessonQuizOrmEntity } from '@/modules/quizzes/infrastructure/entity/lesson-quiz.orm-entity';
import { QuizOrmEntity } from '@/modules/quizzes/infrastructure/entity/quiz.orm-entity';
import { QuizQuestionOrmEntity } from '@/modules/quizzes/infrastructure/entity/quiz-question.orm-entity';
import { QuizOptionOrmEntity } from '@/modules/quizzes/infrastructure/entity/quiz-option.orm-entity';

@CommandHandler(CloneCourseCommand)
export class CloneCourseHandler implements ICommandHandler<CloneCourseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(CourseOrmEntity)
    private readonly courseRepo: Repository<CourseOrmEntity>,
    @InjectRepository(CategoryCourseOrmEntity)
    private readonly categoryCourseRepo: Repository<CategoryCourseOrmEntity>,
    @InjectRepository(LessonMaterialOrmEntity)
    private readonly materialRepo: Repository<LessonMaterialOrmEntity>,
    @InjectRepository(LessonQuizOrmEntity)
    private readonly lessonQuizRepo: Repository<LessonQuizOrmEntity>,
    @InjectRepository(QuizOrmEntity)
    private readonly quizRepo: Repository<QuizOrmEntity>,
    @InjectRepository(QuizQuestionOrmEntity)
    private readonly questionRepo: Repository<QuizQuestionOrmEntity>,
    @InjectRepository(QuizOptionOrmEntity)
    private readonly optionRepo: Repository<QuizOptionOrmEntity>,
  ) {}

  async execute(command: CloneCourseCommand) {
    const originalCourse = await this.courseRepository.findById(
      command.courseId,
    );

    if (!originalCourse) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (!originalCourse.id) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const caller = await this.userRepo.findOne({
      where: { id: Number(command.instructorId) },
    });
    if (
      caller?.role !== UserRole.ADMIN &&
      Number(originalCourse.instructorId) !== Number(command.instructorId)
    ) {
      throw new ForbiddenException('Bạn chỉ có thể sao chép khóa học của mình.');
    }

    if (originalCourse.status === CourseStatus.ARCHIVED) {
      throw new ConflictException(
        'Version này đã được thay thế bằng version mới hơn. Hãy sao chép từ version mới nhất.',
      );
    }

    const existingClone = await this.courseRepository.findUnpublishedClone(
      originalCourse.id,
    );

    if (existingClone) {
      throw new ConflictException(
        'Khóa học này đã có bản sao đang chờ xử lý. Vui lòng publish bản sao hiện tại trước khi tạo bản sao mới.',
      );
    }

    const [{ max: maxChildVersion } = {}] = await this.courseRepo.query(
      'SELECT MAX(version) AS max FROM courses WHERE parent_id = $1',
      [originalCourse.id],
    );
    const nextVersion =
      Math.max(originalCourse.version || 1, Number(maxChildVersion ?? 0)) + 1;
    const clonedCourse = Course.create({
      title: originalCourse.title,
      slug: SlugUtil.generate(`${originalCourse.title}-v${nextVersion}`),
      description: originalCourse.description,
      thumbnail: originalCourse.thumbnail,
      level: originalCourse.level,
      price: originalCourse.price,
      status: CourseStatus.DRAFT,
      parentId: originalCourse.id,
      version: nextVersion,
      instructorId: originalCourse.instructorId,
    });

    const savedCourse = await this.courseRepository.create(clonedCourse);

    if (!savedCourse.id) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.cloneCategories(originalCourse.id, savedCourse.id);

    const sections = await this.sectionRepository.findByCourseId(
      originalCourse.id,
    );

    const clonedQuizIds = new Map<string, string>();

    for (const originalSection of sections) {
      const clonedSection = Section.create({
        courseId: savedCourse.id,
        title: originalSection.title,
        slug: originalSection.slug,
        description: originalSection.description,
        position: originalSection.position,
        isActive: originalSection.isActive,
      });

      const savedSection = await this.sectionRepository.create(clonedSection);

      if (!savedSection.id) {
        throw new AppException(ErrorCode.SECTION_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (!originalSection.id) {
        throw new AppException(ErrorCode.SECTION_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      const lessons = await this.lessonRepository.findBySectionId(
        originalSection.id,
      );

      for (const originalLesson of lessons) {
        if (!originalLesson.id) {
          throw new AppException(ErrorCode.LESSON_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        const clonedLesson = Lesson.create({
          sectionId: savedSection.id,
          title: originalLesson.title,
          slug: originalLesson.slug,
          type: originalLesson.type,
          videoProvider: originalLesson.videoProvider,
          videoSource: originalLesson.videoSource,
          thumbnail: originalLesson.thumbnail,
          duration: originalLesson.duration,
          content: originalLesson.content,
          position: originalLesson.position,
          status: originalLesson.status,
          isPreview: originalLesson.isPreview,
        });

        const savedLesson = await this.lessonRepository.create(clonedLesson);

        if (!savedLesson.id) {
          throw new AppException(ErrorCode.LESSON_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        await this.cloneLessonContent(
          originalLesson.id,
          savedLesson.id,
          clonedQuizIds,
        );
      }
    }

    return savedCourse;
  }

  // Bản sao có danh mục riêng để version cũ không bị ghi đè
  private async cloneCategories(
    originalCourseId: number,
    clonedCourseId: number,
  ) {
    const categories = await this.categoryCourseRepo.find({
      where: { courseId: String(originalCourseId) },
    });

    if (!categories.length) return;

    await this.categoryCourseRepo.insert(
      categories.map((c) => ({
        courseId: String(clonedCourseId),
        categoryId: c.categoryId,
      })),
    );
  }

  // Tài liệu và quiz copy riêng theo version; quiz trùng giữa các bài chỉ copy 1 lần
  private async cloneLessonContent(
    originalLessonId: number,
    clonedLessonId: number,
    clonedQuizIds: Map<string, string>,
  ) {
    const materials = await this.materialRepo.find({
      where: { lessonId: String(originalLessonId) },
    });

    if (materials.length) {
      await this.materialRepo.insert(
        materials.map((m) => ({
          lessonId: String(clonedLessonId),
          title: m.title,
          description: m.description,
          fileKey: m.fileKey,
          fileName: m.fileName,
          fileSize: m.fileSize,
          mimeType: m.mimeType,
          position: m.position,
        })),
      );
    }

    const lessonQuizzes = await this.lessonQuizRepo.find({
      where: { lessonId: String(originalLessonId) },
    });

    for (const lessonQuiz of lessonQuizzes) {
      let newQuizId = clonedQuizIds.get(lessonQuiz.quizId);

      if (!newQuizId) {
        newQuizId = (await this.cloneQuiz(lessonQuiz.quizId)) ?? '';
        if (newQuizId) clonedQuizIds.set(lessonQuiz.quizId, newQuizId);
      }

      if (newQuizId) {
        await this.lessonQuizRepo.insert({
          lessonId: String(clonedLessonId),
          quizId: newQuizId,
        });
      }
    }
  }

  // Copy quiz + câu hỏi + đáp án; null khi pivot trỏ tới quiz đã xóa
  private async cloneQuiz(originalQuizId: string): Promise<string | null> {
    const quiz = await this.quizRepo.findOne({
      where: { id: originalQuizId },
    });

    if (!quiz) return null;

    const quizInserted = await this.quizRepo.insert({
      title: quiz.title,
      description: quiz.description,
      isPremium: quiz.isPremium,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      shuffleQuestions: quiz.shuffleQuestions,
      shuffleOptions: quiz.shuffleOptions,
      showAnswerAfterSubmit: quiz.showAnswerAfterSubmit,
      createdBy: quiz.createdBy,
    });
    const newQuizId = String(quizInserted.identifiers[0].id);

    const questions = await this.questionRepo.find({
      where: { quizId: originalQuizId },
      order: { position: 'ASC' },
    });

    if (questions.length) {
      const questionInserted = await this.questionRepo.insert(
        questions.map((q) => ({
          quizId: newQuizId,
          question: q.question,
          type: q.type,
          audioUrl: q.audioUrl,
          imageUrl: q.imageUrl,
          explanation: q.explanation,
          points: q.points,
          position: q.position,
        })),
      );
      const newQuestionIds = questionInserted.identifiers.map((i) =>
        String(i.id),
      );

      const options = await this.optionRepo.find({
        where: { questionId: In(questions.map((q) => q.id)) },
      });

      if (options.length) {
        const questionIdMap = new Map(
          questions.map((q, idx) => [q.id, newQuestionIds[idx]]),
        );

        await this.optionRepo.insert(
          options.map((o) => ({
            questionId: questionIdMap.get(o.questionId)!,
            content: o.content,
            isCorrect: o.isCorrect,
            position: o.position,
          })),
        );
      }
    }

    return newQuizId;
  }
}
 