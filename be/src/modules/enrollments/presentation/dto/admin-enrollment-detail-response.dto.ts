export class AdminEnrollmentDetailResponseDto {
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
