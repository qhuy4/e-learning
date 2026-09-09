export interface RevenueSummary {
  totalEarned: number;
  pendingPayout: number;
  revenueSharePct: number;
  totalStudents: number;
  avgRating: number;
  totalRevenue: number;
}

export interface RevenueByCourse {
  courseId: string;
  courseTitle: string;
  courseThumbnail: string | null;
  enrollmentCount: number;
  totalRevenue: number;
  instructorShare: number;
  revenueSharePct: number;
}
