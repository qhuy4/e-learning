import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetInstructorEnrollmentsQuery } from '@/modules/enrollments/application/query/get-instructor-enrollments.query';
import { ENROLLMENT_REPOSITORY, IEnrollmentRepository } from '@/modules/enrollments/domain/repository/enrollment.repository';
import { EnrollmentDtoMapper } from '@/modules/enrollments/presentation/mappers/enrollment-dto.mapper';

@QueryHandler(GetInstructorEnrollmentsQuery)
export class GetInstructorEnrollmentsHandler implements IQueryHandler<GetInstructorEnrollmentsQuery> {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async execute(query: GetInstructorEnrollmentsQuery) {
    const result = await this.enrollmentRepository.findAllByInstructorId(query.data);
    return {
      data: result.data.map((e) => EnrollmentDtoMapper.toListDto(e)),
      meta: result.meta,
    };
  }
}
