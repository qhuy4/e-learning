import { CourseOrmEntity } from '../../infrastructure/entity/course.orm-entity';

export class CourseDetailResponseDto {
  id: string;
  instructorId: string;

  title: string;
  slug: string;

  description: string | null;
  thumbnail: string | null;

  level: number;
  price: number;

  publishedAt: Date | null;
  createdAt: Date | null;

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
  };

  sections: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    position: number;

    lessons: {
      id: string;
      title: string;
      slug: string;
      type: string;
      duration: number | null;
      position: number;
      isPreview: boolean;
    }[];
  }[];

  static fromEntity(course: CourseOrmEntity): CourseDetailResponseDto {
    const dto = new CourseDetailResponseDto();

    dto.id = course.id;
    dto.instructorId = course.instructorId;

    dto.title = course.title;
    dto.slug = course.slug;

    dto.description = course.description;
    dto.thumbnail = course.thumbnail;

    dto.level = Number(course.level);
    dto.price = Number(course.price);

    dto.publishedAt = course.publishedAt;
    dto.createdAt = course.createdAt;

    // dto.instructor = {
    //   id: instructor.id,
    //   userId: instructor.userId,
    //   headline: instructor.headline,
    //   bio: instructor.bio,
    //   websiteUrl: instructor.websiteUrl,
    //   socialLinks: instructor.socialLinks,
    // };
    dto.instructor = null;

    // dto.statistics = {
    //   studentCount: instructor.totalStudents,
    //   averageRating: Number(instructor.avgRating),
    //   reviewCount,
    // };

    dto.sections = (course.sections ?? []).map((section) => ({
      id: section.id,
      title: section.title,
      slug: section.slug,
      description: section.description,
      position: section.position,

      lessons: (section.lessons ?? []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        type: lesson.type,
        duration: lesson.duration,
        position: lesson.position,
        isPreview: lesson.isPreview,
      })),
    }));

    return dto;
  }
}
