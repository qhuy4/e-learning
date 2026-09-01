import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';

import { GetUserByIdQuery } from '../query/get-user-by-id.query';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import { GetUserByIdResponse } from '@/modules/users/presentation/dto/admin/get-user-by-id.response';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

import { UserResponseMapper } from '@/modules/users/presentation/mapper/user-response.mapper';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<
  GetUserByIdQuery,
  GetUserByIdResponse
> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByIdQuery): Promise<GetUserByIdResponse> {
    const { id } = query.data;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return UserResponseMapper.toDetail(user);
  }
}
