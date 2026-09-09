export interface AdminEnrollment {
  id: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  progress: number;
  status: number;
  enrolledAt: Date | null;
  createdAt: Date | null;
}

export interface AdminEnrollmentDetail {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail: string | null;
  progress: number;
  status: number;
  pricePaid: number | null;
  currency: string;
  completedAt: Date | null;
  lastAccessedAt: Date | null;
  expiresAt: Date | null;
  enrolledAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export const EnrollmentStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
  COMPLETED: 2,
} as const;

export type EnrollmentStatus = (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus];

export const enrollmentStatusLabel: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.INACTIVE]: "Không hoạt động",
  [EnrollmentStatus.ACTIVE]: "Đang học",
  [EnrollmentStatus.COMPLETED]: "Hoàn thành",
};

export const enrollmentStatusClassName: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.INACTIVE]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  [EnrollmentStatus.ACTIVE]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  [EnrollmentStatus.COMPLETED]: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};
