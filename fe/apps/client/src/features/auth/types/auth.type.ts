export interface User {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}
