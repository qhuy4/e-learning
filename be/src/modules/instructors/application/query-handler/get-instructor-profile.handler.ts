import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetInstructorProfileQuery } from '@/modules/instructors/application/query/get-instructor-profile.query';
import { GetInstructorListResponse } from '@/modules/instructors/presentation/dto/admin/get-instructor-profile.response';
import { InstructorProfileRepository } from '@/modules/instructors/infrastructure/repository/instructor-profile.repository';
import {
  InstructorProfileMapperResponseMapper
} from '@/modules/instructors/infrastructure/mapper/instructor-profifle.mapper';

@QueryHandler(GetInstructorProfileQuery)
export class GetInstructorProfileHandler implements IQueryHandler<
  GetInstructorProfileQuery,
  GetInstructorListResponse
> {
  constructor(
    private readonly instructorProfileRepository: InstructorProfileRepository,
  ) {}

  async execute(
    query: GetInstructorProfileQuery,
  ): Promise<GetInstructorListResponse> {
    const { page, limit, keyword } = query.data;
    const { instructors, total } =
      await this.instructorProfileRepository.findAll({
        page: page,
        limit: limit,
        keyword: keyword,
      });

    return {
      data: instructors.map((user) =>
        InstructorProfileMapperResponseMapper.toResponse(user),
      ),
      meta: {
        page: page,
        limit: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
