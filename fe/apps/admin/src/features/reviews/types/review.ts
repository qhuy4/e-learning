export interface ReviewUser {
    id: number;
    name: string;
    email: string;
}

export interface ReviewCourse {
    id: string;
    title: string;
    slug: string;
}

export interface Review {
    id: string;
    userId: string;
    courseId: string;
    rating: number;
    comment: string | null;
    status: number;
    createdAt: Date | null;
    updatedAt: Date | null;
    user?: ReviewUser;
    course?: ReviewCourse;
}

export type ReviewStatus = 1 | 2 | 3;

export const reviewStatusLabel: Record<ReviewStatus, string> = {
    1: "Hiện",
    2: "Ẩn",
    3: "Vi phạm",
};

export const reviewStatusClassName: Record<ReviewStatus, string> = {
    1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    2: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    3: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
