import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetLessonByIdQuery } from '@/modules/lessons/application/query/get-lesson-by-id.query';
import { LESSON_REPOSITORY, ILessonRepository } from '@/modules/lessons/domain/repository/lesson.repository';
import { FileStorage } from '@/common/storage/domain/interface/file-storage.interface';
import { FILE_STORAGE } from '@/common/storage/domain/interface/file-storage.interface';

async function resolveSignedUrl(key: string | null, storage: FileStorage): Promise<string | null> {
  if (!key) return null;
  if (key.startsWith('http')) return key;
  try {
    return await storage.createDownloadUrl({ key, expiresIn: 3600 });
  } catch {
    return null;
  }
}

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
      throw new NotFoundException('Lesson not found');
    }

    return {
      id: lesson.id,
      sectionId: lesson.sectionId,
      title: lesson.title,
      slug: lesson.slug,
      type: lesson.type,
      videoProvider: lesson.videoProvider,
      videoSource: await resolveSignedUrl(lesson.videoSource, this.storage),
      duration: lesson.duration,
      content: lesson.content,
      position: lesson.position,
      isPreview: lesson.isPreview,
      status: lesson.status,
    };
  }
}
