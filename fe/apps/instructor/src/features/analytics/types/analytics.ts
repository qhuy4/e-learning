export interface LessonPerformance {
  lessonId: string;
  title: string;
  type: string;
  position: number;
  sectionId: string;
  totalStarted: number;
  completed: number;
  completionRate: number | null;
  avgWatchTime: number;
  dropOffRate: number | null;
}

export interface SectionAnalytics {
  id: string;
  title: string;
  position: number;
  lessons: LessonPerformance[];
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface TrendPoint {
  date: string;
  count?: number;
  revenue?: number;
}

export interface CourseAnalytics {
  overview: {
    totalStudents: number;
    totalViews: number;
    completionRate: number;
    avgRating: number;
    totalRevenue: number;
  };
  enrollmentTrend: TrendPoint[];
  viewsTrend: TrendPoint[];
  enrollmentGrowth: {
    currentPeriod: number;
    previousPeriod: number;
    growthRate: number | null;
  };
  engagement: {
    activeStudents: number;
    completedStudents: number;
    avgProgress: number;
    avgLearningTime: number;
    totalLearningTime: number;
  };
  sections: SectionAnalytics[];
  rating: {
    avgRating: number;
    totalReviews: number;
    distribution: RatingDistribution[];
  };
  revenue: {
    totalRevenue: number;
    periodRevenue: number;
    trend: TrendPoint[];
  };
}

export type DateRange = "7d" | "30d" | "90d" | "6m" | "1y" | "all" | "custom";

export const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "90d", label: "90 ngày" },
  { value: "6m", label: "6 tháng" },
  { value: "1y", label: "1 năm" },
  { value: "all", label: "Tất cả" },
  { value: "custom", label: "Tùy chỉnh" },
];
