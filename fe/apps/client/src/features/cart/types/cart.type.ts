export interface CartItem {
  courseId: number;
  instructorId: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  instructor?: {
    id: number;
    headline: string | null;
  } | null;
  statistics?: {
    studentCount: number;
    averageRating: number;
    reviewCount: number;
  } | null;
}
