import { PaginationMeta } from '@/common/pagination/pagination.meta';
import {
  UserRoleApi,
  UserStatusApi,
} from '@/modules/users/presentation/mapper/enum.mapper';

export interface GetUsersResponse {
  data: {
    id: number;
    name: string;
    email: string;
    status: UserStatusApi;
    role: UserRoleApi;
    createdAt: Date | null;
    updatedAt: Date | null;
    profile: {
      id: number;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    } | null;
  }[];
  meta: PaginationMeta;
}
