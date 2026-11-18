import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetLessonDictationsQuery } from '../query/get-lesson-dictations.query';
import { Inject } from '@nestjs/common';
import { ILessonDictationRepository, LESSON_DICTATION_REPOSITORY } from '../../domain/repository/lesson-dictation.repository';
import { IDictationRepository, DICTATION_REPOSITORY } from '../../domain/repository/dictation.repository';
import { IDictationSentenceRepository, DICTATION_SENTENCE_REPOSITORY } from '../../domain/repository/dictation-sentence.repository';
import { DictationDetail } from '../query/get-dictation-by-id.query';

@QueryHandler(GetLessonDictationsQuery)
export class GetLessonDictationsHandler implements IQueryHandler<GetLessonDictationsQuery> {
  constructor(
    @Inject(LESSON_DICTATION_REPOSITORY) private lessonDictRepo: ILessonDictationRepository,
    @Inject(DICTATION_REPOSITORY) private dictRepo: IDictationRepository,
    @Inject(DICTATION_SENTENCE_REPOSITORY) private sentenceRepo: IDictationSentenceRepository
  ) {}
  async execute(query: GetLessonDictationsQuery) {
    const mappings = await this.lessonDictRepo.findByLessonId(Number(query.lessonId));
    const dicts: DictationDetail[] = [];
    for (const m of mappings) {
      const dict = await this.dictRepo.findById(Number(m.dictationId));
      if (dict) {
        const sentences = await this.sentenceRepo.findByDictationId(Number(dict.id));
        dicts.push({ ...dict, sentences });
      }
    }
    return dicts;
  }
}
