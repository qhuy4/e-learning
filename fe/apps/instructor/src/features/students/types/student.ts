export interface InstructorEnrollment {
  id: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  status: number;
  enrolledAt: string | null;
}

export const EnrollmentStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
  COMPLETED: 2,
} as const;

export const ENROLLMENT_STATUS_LABELS: Record<number, string> = {
  0: "Chưa kích hoạt",
  1: "Đang học",
  2: "Hoàn thành",
};

export const ENROLLMENT_STATUS_CLASSES: Record<number, string> = {
  0: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  1: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  2: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};
