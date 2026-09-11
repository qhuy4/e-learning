import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChevronLeft } from "lucide-react";
import { useCourseAnalytics } from "@/features/analytics/hooks/use-analytics";
import {
  DATE_RANGE_OPTIONS,
  type DateRange,
  type SectionAnalytics,
  type LessonPerformance,
} from "@/features/analytics/types/analytics";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@fe/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fe/components/ui/tabs";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

function StatsCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function SectionBlock({ section }: { section: SectionAnalytics }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 font-medium text-sm">
        {section.title}
      </div>
      <div className="divide-y">
        {section.lessons.map((lesson) => (
          <LessonRow key={lesson.lessonId} lesson={lesson} />
        ))}
      </div>
    </div>
  );
}

function LessonRow({ lesson }: { lesson: LessonPerformance }) {
  const dropOff = lesson.dropOffRate;
  const isHighDropOff = dropOff !== null && dropOff > 40;

  return (
    <div className="flex items-center gap-4 px-4 py-3 text-sm">
      <div className="flex-1 min-w-0">
        <span className="font-medium truncate block">{lesson.title}</span>
        <span className="text-xs text-muted-foreground">
          {lesson.totalStarted} bắt đầu · {lesson.completed} hoàn thành
        </span>
      </div>
      <div className="text-right shrink-0 w-20">
        <span
          className={`font-medium ${
            lesson.completionRate !== null && lesson.completionRate >= 80
              ? "text-emerald-600"
              : lesson.completionRate !== null && lesson.completionRate >= 50
                ? "text-amber-600"
                : "text-red-600"
          }`}
        >
          {lesson.completionRate !== null ? `${lesson.completionRate}%` : "N/A"}
        </span>
      </div>
      <div className="text-right shrink-0 w-20">
        {isHighDropOff ? (
          <Badge variant="destructive" className="text-xs">
            {dropOff}% drop
          </Badge>
        ) : dropOff !== null ? (
          <span className="text-xs text-muted-foreground">{dropOff}%</span>
        ) : (
          <span className="text-xs text-muted-foreground">N/A</span>
        )}
      </div>
      <div className="text-right shrink-0 w-16 text-xs text-muted-foreground">
        {formatDuration(lesson.avgWatchTime)}
      </div>
    </div>
  );
}

function RatingBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right text-muted-foreground">{star}★</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 text-right text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

export default function CourseAnalyticsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const { data, isLoading, isFetching } = useCourseAnalytics(
    courseId,
    dateRange
  );

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!data) return null;

  const analytics = data.data ?? data;

  // Merge enrollment + views trend for chart
  const trendMap = new Map<string, { date: string; enrollments: number; views: number }>();
  for (const e of analytics.enrollmentTrend ?? []) {
    trendMap.set(e.date, { date: e.date, enrollments: e.count, views: 0 });
  }
  for (const v of analytics.viewsTrend ?? []) {
    const existing = trendMap.get(v.date);
    if (existing) {
      existing.views = v.count;
    } else {
      trendMap.set(v.date, { date: v.date, enrollments: 0, views: v.count });
    }
  }
  const trendData = Array.from(trendMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Revenue trend data
  const revenueData = (analytics.revenue?.trend ?? []).map((r: any) => ({
    date: r.date,
    revenue: Number(r.revenue),
  }));

  // Rating distribution
  const ratingDist = analytics.rating?.distribution ?? [];
  const ratingMap = new Map<number, number>();
  for (const r of ratingDist) {
    ratingMap.set(r.rating, r.count);
  }
  const totalReviews = analytics.rating?.totalReviews ?? 0;

  const growthRate = analytics.enrollmentGrowth?.growthRate;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/courses")}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Phân tích khóa học
            </h1>
            <p className="text-xs text-muted-foreground">
              {isFetching ? "Đang tải..." : ""}
            </p>
          </div>
        </div>

        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="h-9 min-w-[140px]">
            {DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label}
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatsCard
          label="Học viên"
          value={analytics.overview?.totalStudents?.toLocaleString("vi-VN") ?? 0}
          subtitle={
            growthRate !== null && growthRate !== undefined
              ? `${growthRate > 0 ? "↑" : growthRate < 0 ? "↓" : ""} ${Math.abs(growthRate)}% so với kỳ trước`
              : undefined
          }
        />
        <StatsCard
          label="Lượt xem"
          value={analytics.overview?.totalViews?.toLocaleString("vi-VN") ?? 0}
        />
        <StatsCard
          label="Tỷ lệ hoàn thành"
          value={`${analytics.overview?.completionRate ?? 0}%`}
        />
        <StatsCard
          label="Đánh giá TB"
          value={analytics.overview?.avgRating ?? 0}
          subtitle={`${analytics.rating?.totalReviews ?? 0} đánh giá`}
        />
        <StatsCard
          label="Doanh thu"
          value={formatCurrency(analytics.overview?.totalRevenue ?? 0)}
        />
      </div>

      {/* Enrollment & Views Trend */}
      {trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Xu hướng ghi danh & lượt xem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  name="Ghi danh"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  name="Lượt xem"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Engagement */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Học viên active"
          value={analytics.engagement?.activeStudents?.toLocaleString("vi-VN") ?? 0}
        />
        <StatsCard
          label="Hoàn thành"
          value={analytics.engagement?.completedStudents?.toLocaleString("vi-VN") ?? 0}
        />
        <StatsCard
          label="Tiến độ TB"
          value={`${analytics.engagement?.avgProgress ?? 0}%`}
        />
        <StatsCard
          label="Thời gian học TB"
          value={formatDuration(analytics.engagement?.avgLearningTime ?? 0)}
        />
      </div>

      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="bg-muted p-1 h-auto rounded-md flex w-fit border border-border/50">
          <TabsTrigger
            value="lessons"
            className="rounded-sm px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium transition-all"
          >
            Hiệu suất bài học
          </TabsTrigger>
          <TabsTrigger
            value="ratings"
            className="rounded-sm px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium transition-all"
          >
            Đánh giá
          </TabsTrigger>
          <TabsTrigger
            value="revenue"
            className="rounded-sm px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium transition-all"
          >
            Doanh thu
          </TabsTrigger>
        </TabsList>

        {/* Lesson Performance */}
        <TabsContent value="lessons" className="mt-4 space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Sắp xếp theo drop-off cao nhất · Click để mở rộng
            </span>
          </div>
          {(analytics.sections ?? [])
            .sort((a: SectionAnalytics, b: SectionAnalytics) => b.position - a.position)
            .map((section: SectionAnalytics) => (
              <SectionBlock key={section.id} section={section} />
            ))}
          {(!analytics.sections || analytics.sections.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Chưa có dữ liệu bài học.
            </p>
          )}
        </TabsContent>

        {/* Rating */}
        <TabsContent value="ratings" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {totalReviews > 0 ? (
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="text-center">
                    <p className="text-4xl font-bold">
                      {analytics.rating?.avgRating ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      / 5 · {totalReviews} đánh giá
                    </p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <RatingBar
                        key={star}
                        star={star}
                        count={ratingMap.get(star) ?? 0}
                        total={totalReviews}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chưa có đánh giá nào.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              label="Tổng doanh thu"
              value={formatCurrency(analytics.revenue?.totalRevenue ?? 0)}
            />
            <StatsCard
              label="Doanh thu kỳ này"
              value={formatCurrency(analytics.revenue?.periodRevenue ?? 0)}
            />
          </div>

          {revenueData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Xu hướng doanh thu</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v: string) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Doanh thu"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
