import { User } from '@/modules/users/domain/entity/user.entity';

import { GetUsersResponse } from '@/modules/users/presentation/dto/admin/get-users.response';
import { GetUserByIdResponse } from '@/modules/users/presentation/dto/admin/get-user-by-id.response';

import {
  mapGender,
  mapUserRole,
  mapUserStatus,
} from '@/modules/users/presentation/mapper/enum.mapper';

export class UserResponseMapper {
  static toListItem(user: User): GetUsersResponse['data'][number] {
    return {
      id: user.id!,
      name: user.name,
      email: user.email,
      status: mapUserStatus(user.status),
      role: mapUserRole(user.role),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
        ? {
            id: user.profile.id!,
            avatarUrl: user.profile.avatarUrl,
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
          }
        : null,
    };
  }

  static toDetail(user: User): GetUserByIdResponse {
    return {
      id: user.id!,
      name: user.name,
      email: user.email,
      status: mapUserStatus(user.status),
      role: mapUserRole(user.role),
      blockReason: user.blockReason,
      blockedAt: user.blockedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
        ? {
            id: user.profile.id!,
            avatarUrl: user.profile.avatarUrl,
            gender: mapGender(user.profile.gender),
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            phone: user.profile.phone,
            dateOfBirth: user.profile.dateOfBirth,
            address: user.profile.address,
            country: user.profile.country,
            city: user.profile.city,
            occupation: user.profile.occupation,
            bio: user.profile.bio,
          }
        : null,
    };
  }
}
