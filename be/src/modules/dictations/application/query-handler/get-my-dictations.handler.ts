import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetMyDictationsQuery } from '../query/get-my-dictations.query';
import { Inject } from '@nestjs/common';
import { IDictationRepository, DICTATION_REPOSITORY } from '../../domain/repository/dictation.repository';

@QueryHandler(GetMyDictationsQuery)
export class GetMyDictationsHandler implements IQueryHandler<GetMyDictationsQuery> {
  constructor(@Inject(DICTATION_REPOSITORY) private dictRepo: IDictationRepository) {}
  async execute(query: GetMyDictationsQuery) {
    return this.dictRepo.findByCreator(Number(query.userId));
  }
}
