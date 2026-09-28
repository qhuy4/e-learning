import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllDictationsQuery } from '../query/get-all-dictations.query';
import { Inject } from '@nestjs/common';
import { IDictationRepository, DICTATION_REPOSITORY } from '../../domain/repository/dictation.repository';

@QueryHandler(GetAllDictationsQuery)
export class GetAllDictationsHandler implements IQueryHandler<GetAllDictationsQuery> {
  constructor(@Inject(DICTATION_REPOSITORY) private dictRepo: IDictationRepository) {}
  async execute() {
    return this.dictRepo.findAll();
  }
}
