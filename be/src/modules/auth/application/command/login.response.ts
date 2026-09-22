export interface LoginHttpResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    avatar: string | null;
  };
}
