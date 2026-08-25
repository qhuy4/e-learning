import { UserProfile } from '@/modules/users/domain/entity/user-profile.entity';

export interface IUserProfileRepository {
  findByUserId(id: number): Promise<UserProfile | null>;
  create(user: UserProfile): Promise<UserProfile>;
}
