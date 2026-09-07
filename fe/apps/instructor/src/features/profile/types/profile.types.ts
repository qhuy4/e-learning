export interface UserProfile {
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  address: string | null;
  country: string | null;
  city: string | null;
  occupation: string | null;
  bio: string | null;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  profile: UserProfile | null;
}

export interface UpdateProfileRequest {
  name?: string;
  profile?: Partial<UserProfile>;
}
