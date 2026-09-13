export interface AdminCourse {
    id: string;
    instructorId: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    level: number;
    price: number;
    status: number;
    rejectReason: string | null;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    publishedAt: Date | null;
    version: number;
    parentId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    sections?: AdminCourseSection[];
    categories?: { id: string; name: string; slug: string }[];
}

export interface AdminCourseSection {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    position: number;
    isActive: boolean;
    lessons?: AdminCourseLesson[];
}

export interface AdminCourseLesson {
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
}

export const CourseStatus = {
    DRAFT: 1,
    PENDING_REVIEW: 2,
    APPROVED: 3,
    REJECTED: 4,
    PUBLISHED: 5,
    ARCHIVED: 6,
} as const;

export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus];

export const courseStatusLabel: Record<CourseStatus, string> = {
    [CourseStatus.DRAFT]: "Bản nháp",
    [CourseStatus.PENDING_REVIEW]: "Chờ duyệt",
    [CourseStatus.APPROVED]: "Đã duyệt",
    [CourseStatus.REJECTED]: "Bị từ chối",
    [CourseStatus.PUBLISHED]: "Đã xuất bản",
    [CourseStatus.ARCHIVED]: "Đã lưu trữ",
};

export const courseStatusClassName: Record<CourseStatus, string> = {
    [CourseStatus.DRAFT]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    [CourseStatus.PENDING_REVIEW]: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    [CourseStatus.APPROVED]: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    [CourseStatus.REJECTED]: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    [CourseStatus.PUBLISHED]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    [CourseStatus.ARCHIVED]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export const CourseLevel = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
} as const;

export type CourseLevel = (typeof CourseLevel)[keyof typeof CourseLevel];

export const courseLevelLabel: Record<CourseLevel, string> = {
    [CourseLevel.BEGINNER]: "Cơ bản",
    [CourseLevel.INTERMEDIATE]: "Trung bình",
    [CourseLevel.ADVANCED]: "Nâng cao",
};
