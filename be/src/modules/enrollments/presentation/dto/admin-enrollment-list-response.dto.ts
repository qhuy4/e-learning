export class AdminEnrollmentListResponseDto {
  id: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  progress: number;
  status: number;
  enrolledAt: Date | null;
  createdAt: Date | null;
}
