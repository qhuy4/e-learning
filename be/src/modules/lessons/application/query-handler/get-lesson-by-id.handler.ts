import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, HttpStatus } from '@nestjs/common';
import { GetLessonByIdQuery } from '@/modules/lessons/application/query/get-lesson-by-id.query';
import { LESSON_REPOSITORY, ILessonRepository } from '@/modules/lessons/domain/repository/lesson.repository';
import { FileStorage } from '@/common/storage/domain/interface/file-storage.interface';
import { FILE_STORAGE } from '@/common/storage/domain/interface/file-storage.interface';

async function resolveSignedUrl(
  key: string | null,
  storage: FileStorage,
): Promise<string | null> {
  if (!key) return null;
  if (key.startsWith('http')) return key;
  try {
    return await storage.createDownloadUrl({ key, expiresIn: 3600 });
  } catch {
    return null;
  }
}

import { LessonDtoMapper } from '../../presentation/mappers/lesson-dto.mapper';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@QueryHandler(GetLessonByIdQuery)
export class GetLessonByIdHandler implements IQueryHandler<GetLessonByIdQuery> {
  constructor(
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(query: GetLessonByIdQuery) {
    const lesson = await this.lessonRepository.findById(query.id);

    if (!lesson) {
      throw new AppException(ErrorCode.LESSON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const signedUrl = await resolveSignedUrl(lesson.videoSource, this.storage);

    return LessonDtoMapper.toDetailDto(lesson, signedUrl);
  }
}
