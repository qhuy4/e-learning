import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInstructorsQuery } from '@/modules/instructors/application/query/get-instructors.query';
import { InstructorRepository } from '@/modules/instructors/infrastructure/repository/instructor.repository';
import { InstructorMapper } from '@/modules/instructors/infrastructure/mapper/instructor.mapper';
import { GetInstructorsResponse } from '@/modules/instructors/presentation/dto/admin/get-instructor.response';

@QueryHandler(GetInstructorsQuery)
export class GetInstructorsHandler implements IQueryHandler<
  GetInstructorsQuery,
  GetInstructorsResponse
> {
  constructor(private readonly instructorRepository: InstructorRepository) {}

  async execute(query: GetInstructorsQuery): Promise<GetInstructorsResponse> {
    const { page, limit, keyword, status, approvalStatus, sortBy, sortOrder } = query.data;
    const { instructors, total } = await this.instructorRepository.findAll({
      page: page,
      limit: limit,
      keyword: keyword,
      status: status,
      approvalStatus: approvalStatus,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });

    return {
      data: instructors.map((user) => InstructorMapper.toResponse(user)),
      meta: {
        page: page,
        limit: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
