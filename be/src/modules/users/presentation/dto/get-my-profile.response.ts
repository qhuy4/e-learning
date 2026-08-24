export interface GetMyProfileResponse {
  id: number;
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