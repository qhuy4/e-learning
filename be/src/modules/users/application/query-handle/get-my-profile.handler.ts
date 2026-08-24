import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetMyProfileQuery } from '../query/get-my-profile.query';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';
import { UserProfileRepository } from '@/modules/users/infrastructure/repository/user-profile.repository';
import { GetMyProfileResponse } from '@/modules/users/presentation/dto/get-my-profile.response';

@QueryHandler(GetMyProfileQuery)
export class GetMyProfileHandler implements IQueryHandler<
  GetMyProfileQuery,
  GetMyProfileResponse
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  async execute(query: GetMyProfileQuery): Promise<GetMyProfileResponse> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      throw new Error('User not found');
    }

    const profile = await this.userProfileRepository.findByUserId(query.userId);

    return {
      id: user.id,
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
