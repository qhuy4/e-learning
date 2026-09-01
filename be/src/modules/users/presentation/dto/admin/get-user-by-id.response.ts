import { GenderApi, UserRoleApi, UserStatusApi } from '@/modules/users/presentation/mapper/enum.mapper';


export interface UserProfileResponse {
  id: number;
  avatarUrl: string | null;
  gender: GenderApi;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  country: string | null;
  city: string | null;
  occupation: string | null;
  bio: string | null;
}
export interface GetUserByIdResponse {
  id: number;
  name: string;
  email: string;
  status: UserStatusApi;
  role: UserRoleApi;
  blockReason: string | null;
  blockedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  profile: UserProfileResponse | null;
}
