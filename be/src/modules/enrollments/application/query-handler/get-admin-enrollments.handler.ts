import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminEnrollmentsQuery } from '@/modules/enrollments/application/query/get-admin-enrollments.query';
import { ENROLLMENT_REPOSITORY, IEnrollmentRepository } from '@/modules/enrollments/domain/repository/enrollment.repository';
import { EnrollmentDtoMapper } from '@/modules/enrollments/presentation/mappers/enrollment-dto.mapper';

@QueryHandler(GetAdminEnrollmentsQuery)
export class GetAdminEnrollmentsHandler implements IQueryHandler<GetAdminEnrollmentsQuery> {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async execute(query: GetAdminEnrollmentsQuery) {
    const result = await this.enrollmentRepository.findAll(query.data);
    return {
      data: result.data.map((e) => EnrollmentDtoMapper.toListDto(e)),
      meta: result.meta,
    };
  }
}
