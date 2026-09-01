import { User } from '@/modules/users/domain/entity/user.entity';

export type UserListItem = {
  user: User;
  profile: {
    id: number;
    avatarUrl: string | null;
    firstName: string;
    lastName: string;
  } | null;
};
