import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDictationByIdQuery } from '../query/get-dictation-by-id.query';
import { Inject, NotFoundException } from '@nestjs/common';
import { IDictationRepository, DICTATION_REPOSITORY } from '../../domain/repository/dictation.repository';
import { IDictationSentenceRepository, DICTATION_SENTENCE_REPOSITORY } from '../../domain/repository/dictation-sentence.repository';

@QueryHandler(GetDictationByIdQuery)
export class GetDictationByIdHandler implements IQueryHandler<GetDictationByIdQuery> {
  constructor(
    @Inject(DICTATION_REPOSITORY) private dictRepo: IDictationRepository,
    @Inject(DICTATION_SENTENCE_REPOSITORY) private sentenceRepo: IDictationSentenceRepository
  ) {}
  async execute(query: GetDictationByIdQuery) {
    const dict = await this.dictRepo.findById(Number(query.id));
    if (!dict) throw new NotFoundException();
    const sentences = await this.sentenceRepo.findByDictationId(Number(query.id));
    return { ...dict, sentences: sentences.sort((a,b) => a.position - b.position) };
  }
}
