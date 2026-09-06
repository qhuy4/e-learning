export const CourseLevel = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
} as const;

export type CourseLevel = typeof CourseLevel[keyof typeof CourseLevel];

export const CourseStatus = {
  DRAFT: 1,
  PENDING_REVIEW: 2,
  APPROVED: 3,
  REJECTED: 4,
  PUBLISHED: 5,
  ARCHIVED: 6,
} as const;

export type CourseStatus = typeof CourseStatus[keyof typeof CourseStatus];