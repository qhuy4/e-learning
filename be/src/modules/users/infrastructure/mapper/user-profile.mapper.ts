import { UserProfileOrmEntity } from '@/modules/users/infrastructure/entity/user-profile.orm.entity';
import { UserProfile } from '@/modules/users/domain/entity/user-profile.entity';

export class UserProfileMapper {
  static toDomain(entity: UserProfileOrmEntity): UserProfile {
    return UserProfile.restore({
      id: entity.id,
      userId: entity.userId,
      avatarUrl: entity.avatarUrl,
      gender: entity.gender,
      firstName: entity.firstName,
      lastName: entity.lastName,
      phone: entity.phone,
      dateOfBirth: entity.dateOfBirth,
      address: entity.address,
      country: entity.country,
      city: entity.city,
      occupation: entity.occupation,
      bio: entity.bio,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(profile: UserProfile): UserProfileOrmEntity {
    const entity = new UserProfileOrmEntity();

    if (profile.id !== null) {
      entity.id = profile.id;
    }

    entity.userId = profile.userId;
    entity.avatarUrl = profile.avatarUrl;
    entity.gender = profile.gender;
    entity.firstName = profile.firstName;
    entity.lastName = profile.lastName;
    entity.phone = profile.phone;
    entity.dateOfBirth = profile.dateOfBirth;
    entity.address = profile.address;
    entity.country = profile.country;
    entity.city = profile.city;
    entity.occupation = profile.occupation;
    entity.bio = profile.bio;

    return entity;
  }
}
