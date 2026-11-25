import { CourseStatus } from '@/modules/courses/domain/enum/course-status.enum';

export class AdminCourseDetailResponseDto {
  id: string;
  instructorId: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  level: number;
  cefrLevelStart: string | null;
  cefrLevelEnd: string | null;
  skillCodes: string[];
  price: number;
  status: CourseStatus;
  rejectReason: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  publishedAt: Date | null;
  version: number;
  parentId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;

  instructor: {
    id: string;
    userId: string;
    headline: string | null;
    bio: string | null;
    websiteUrl: string | null;
    socialLinks: Record<string, unknown> | null;
  } | null;

  statistics: {
    studentCount: number;
    averageRating: number;
    reviewCount: number;
    totalRevenue?: number;
  };

  sections: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    position: number;
    isActive: boolean;
    createdAt: Date | null;
    deletedAt: Date | null;

    lessons: {
      id: string;
      title: string;
      slug: string;
      type: string;
      duration: number | null;
      position: number;
      isPreview: boolean;
      videoUrl?: string | null;
      content: string | null;
      isActive: boolean;
      createdAt: Date | null;
      deletedAt: Date | null;
    }[];
  }[];

  categories: { id: string; name: string; slug: string }[];
}
