import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetUsersQuery } from '@/modules/users/application/query/get-users.query';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';
import { GetUsersResponse } from '@/modules/users/presentation/dto/admin/get-users.response';
import { UserResponseMapper } from '@/modules/users/presentation/mapper/user-response.mapper';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<
  GetUsersQuery,
  GetUsersResponse
> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUsersQuery): Promise<GetUsersResponse> {
    const { page, limit, keyword, sortBy, sortOrder, role } = query.data;
    const { users, total } = await this.userRepository.findAll({
      page,
      limit,
      keyword,
      sortBy,
      sortOrder,
      role,
    });

    return {
      data: users.map((user) => UserResponseMapper.toListItem(user)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
