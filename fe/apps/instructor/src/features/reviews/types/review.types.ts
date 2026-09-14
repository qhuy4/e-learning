export interface Review {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string | null;
  status: number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
  };
}
