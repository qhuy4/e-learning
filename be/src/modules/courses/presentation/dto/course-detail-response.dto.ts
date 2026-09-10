export class CourseDetailResponseDto {
  id: number;
  instructorId: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  level: number;
  price: number;
  publishedAt: Date | null;
  createdAt: Date | null;

  instructor: {
    id: number;
    userId: number;
    headline: string | null;
    bio: string | null;
    websiteUrl: string | null;
    socialLinks: Record<string, unknown> | null;
  } | null;

  statistics: {
    studentCount: number;
    averageRating: number;
    reviewCount: number;
  };

  sections: {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    position: number;

    lessons: {
      id: number;
      title: string;
      slug: string;
      type: string;
      duration: number | null;
      position: number;
      isPreview: boolean;
    }[];
  }[];
}
