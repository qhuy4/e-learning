import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminEnrollmentByIdQuery } from '@/modules/enrollments/application/query/get-admin-enrollment-by-id.query';
import { ENROLLMENT_REPOSITORY, IEnrollmentRepository } from '@/modules/enrollments/domain/repository/enrollment.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { EnrollmentDtoMapper } from '@/modules/enrollments/presentation/mappers/enrollment-dto.mapper';

@QueryHandler(GetAdminEnrollmentByIdQuery)
export class GetAdminEnrollmentByIdHandler implements IQueryHandler<GetAdminEnrollmentByIdQuery> {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async execute(query: GetAdminEnrollmentByIdQuery) {
    const enrollment = await this.enrollmentRepository.findById(query.data.id);
    if (!enrollment) {
      throw new AppException(ErrorCode.ENROLLMENT_NOT_FOUND, 404);
    }
    return EnrollmentDtoMapper.toDetailDto(enrollment);
  }
}
