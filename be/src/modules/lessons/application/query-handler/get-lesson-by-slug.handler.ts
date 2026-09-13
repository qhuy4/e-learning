import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { GetLessonBySlugQuery } from '../query/get-lesson-by-slug.query';
import {
  LESSON_REPOSITORY,
  ILessonRepository,
} from '../../domain/repository/lesson.repository';
import { FileStorage } from '../../../../common/storage/domain/interface/file-storage.interface';
import { FILE_STORAGE } from '../../../../common/storage/domain/interface/file-storage.interface';
import {
  ENROLLMENT_REPOSITORY,
  IEnrollmentRepository,
} from '@/modules/enrollments/domain/repository/enrollment.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function resolveSignedUrl(
  key: string | null,
  storage: FileStorage,
  logger?: Logger,
): Promise<string | null> {
  if (!key) {
    logger?.warn(`resolveSignedUrl: key is null/empty`);
    return null;
  }
  if (key.startsWith('http')) return key;
  try {
    const url = await storage.createDownloadUrl({ key, expiresIn: 3600 });
    logger?.debug(`resolveSignedUrl: signed URL generated for key=${key}`);
    return url;
  } catch (err) {
    logger?.error(`resolveSignedUrl: failed for key=${key}, error=${(err as Error).message}`);
    return null;
  }
}

import { LessonDtoMapper } from '../../presentation/mappers/lesson-dto.mapper';
import { SectionOrmEntity } from '@/modules/sections/infrastructure/entity/section.orm-entity';

@QueryHandler(GetLessonBySlugQuery)
export class GetLessonBySlugHandler implements IQueryHandler<GetLessonBySlugQuery> {
  private readonly logger = new Logger(GetLessonBySlugHandler.name);

  constructor(
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @InjectRepository(SectionOrmEntity)
    private readonly sectionRepository: Repository<SectionOrmEntity>,
  ) {}

  async execute(query: GetLessonBySlugQuery) {
    this.logger.debug(`getLessonBySlug: slug=${query.slug}, userId=${query.userId}`);

    const lesson = await this.lessonRepository.findGlobalBySlug(query.slug);

    if (!lesson) {
      this.logger.debug(`Lesson not found: slug=${query.slug}`);
      throw new NotFoundException('Lesson not found');
    }

    this.logger.debug(`Lesson found: id=${lesson.id}, sectionId=${lesson.sectionId}, isPreview=${lesson.isPreview}`);

    let canViewVideo = lesson.isPreview;

    if (canViewVideo) {
      this.logger.debug(`Lesson is preview → canViewVideo=true`);
    }

    if (!canViewVideo && query.userId && lesson.sectionId) {
      const section = await this.sectionRepository.findOne({
        where: { id: lesson.sectionId.toString() },
      });
      this.logger.debug(`Section lookup: sectionId=${lesson.sectionId}, found=${!!section}, courseId=${section?.courseId}`);

      if (section) {
        canViewVideo = await this.enrollmentRepository.existsActiveByUserAndCourse(
          query.userId,
          Number(section.courseId),
        );
        this.logger.debug(`Enrollment check: userId=${query.userId}, courseId=${section.courseId}, enrolled=${canViewVideo}`);
      } else {
        this.logger.warn(`Section NOT found for sectionId=${lesson.sectionId} → canViewVideo=false`);
      }
    } else if (!canViewVideo) {
      this.logger.warn(`Enrollment check SKIPPED: userId=${query.userId}, sectionId=${lesson.sectionId} → canViewVideo=false`);
    }

    this.logger.debug(`canViewVideo=${canViewVideo}, videoSource=${lesson.videoSource}`);

    const signedUrl = canViewVideo
      ? await resolveSignedUrl(lesson.videoSource, this.storage, this.logger)
      : null;

    this.logger.debug(`Result: signedUrl=${signedUrl ? 'present' : 'null'}`);

    return LessonDtoMapper.toDetailDto(lesson, signedUrl);
  }
}
