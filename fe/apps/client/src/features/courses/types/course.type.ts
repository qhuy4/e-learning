import type { CourseLevel, CourseStatus } from "./course.enums";

export interface Course {
  id: number;

  instructorId: number;

  title: string;
  slug: string;

  description: string | null;
  thumbnail: string | null;

  level: CourseLevel;
  price: number;

  status: CourseStatus;

  reviewedBy: number | null;
  reviewedAt: string | null;

  publishedAt: string | null;

  rejectReason: string | null;

  parentId: number | null;

  version: number;

  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface GetCoursesParams {
  page?: number;  
  limit?: number;
  level?: number;
  keyword?: string;
}

export interface CourseDetail extends Course {
  instructor: {
    id: number;
    name: string | null;
    headline: string | null;
    bio: string | null;
    websiteUrl: string | null;
  } | null;

  statistics: {
    studentCount: number;
    reviewCount: number;
    averageRating: number;
  };

  sections: CourseSection[];
}

export interface CourseSection {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  position: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: number;
  title: string;
  slug: string;
  type: string;
  duration: number | null;
  position: number;
  isPreview: boolean;
}