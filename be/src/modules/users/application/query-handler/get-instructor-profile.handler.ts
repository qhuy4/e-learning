import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';

import { GetInstructorProfileQuery } from '@/modules/users/application/query/get-instructor-profile.query';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';
import { UserProfileRepository } from '@/modules/users/infrastructure/repository/user-profile.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

export interface GetInstructorProfileResponse {
  id: number;
  name: string;
  email: string;
  profile: {
    avatarUrl: string | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    dateOfBirth: Date | null;
    address: string | null;
    country: string | null;
    city: string | null;
    occupation: string | null;
    bio: string | null;
  } | null;
}

@QueryHandler(GetInstructorProfileQuery)
export class GetInstructorProfileHandler
  implements IQueryHandler<GetInstructorProfileQuery, GetInstructorProfileResponse>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  async execute(query: GetInstructorProfileQuery): Promise<GetInstructorProfileResponse> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const profile = await this.userProfileRepository.findByUserId(query.userId);

    return {
      id: user.id!,
      name: user.name,
      email: user.email,
      profile: profile
        ? {
            avatarUrl: profile.avatarUrl,
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            dateOfBirth: profile.dateOfBirth,
            address: profile.address,
            country: profile.country,
            city: profile.city,
            occupation: profile.occupation,
            bio: profile.bio,
          }
        : null,
    };
  }
}
