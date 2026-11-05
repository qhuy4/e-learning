import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Star,
  Users,
  Eye,
  GraduationCap,
  Coins,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
} from "lucide-react";
import { useCourseAnalytics } from "@/features/analytics/hooks/use-analytics";
import {
  DATE_RANGE_OPTIONS,
  type DateRange,
  type LessonPerformance,
  type SectionAnalytics,
} from "@/features/analytics/types/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@fe/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import { TooltipProvider } from "@fe/components/ui/tooltip";
import { Button } from "@fe/components/ui/button";

function useThemeColor(varName: string): string {
  const [color, setColor] = useState("oklch(0.5 0 0)");
  useEffect(() => {
    const el = document.documentElement;
    const update = () => {
      const v = getComputedStyle(el).getPropertyValue(varName).trim();
      if (v) setColor(v);
    };
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [varName]);
  return color;
}

function useChartColors() {
  const c1 = useThemeColor("--chart-1");
  const c2 = useThemeColor("--chart-2");
  const c3 = useThemeColor("--chart-3");
  const c4 = useThemeColor("--chart-4");
  const c5 = useThemeColor("--chart-5");
  return [c1, c2, c3, c4, c5];
}

function useBorderColor() {
  return useThemeColor("--border");
}

function useMutedFg() {
  return useThemeColor("--muted-foreground");
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (s > 0) return `${m}m ${s}s`;
  return `${m}m`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

function getDateAxisFormatter(dateRange: DateRange) {
  if (dateRange === "7d") return (v: string) => v.slice(5);
  if (dateRange === "30d") return (v: string) => v.slice(5);
  if (dateRange === "90d")
    return (v: string) => {
      const [, m, d] = v.split("-");
      return `${d}/${m}`;
    };
  return (v: string) => v.slice(5);
}

function getDateTickInterval(dateRange: DateRange) {
  if (dateRange === "7d") return 0;
  if (dateRange === "30d") return 3;
  if (dateRange === "90d") return 6;
  if (dateRange === "6m") return 14;
  if (dateRange === "1y") return 14;
  return undefined;
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
    <div className="flex items-center gap-2.5">
      <span className="w-3 text-right text-xs text-muted-foreground tabular-nums">
        {star}
      </span>
      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

function CustomTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {entry.value.toLocaleString("vi-VN")}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CourseAnalyticsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const { data, isLoading, isFetching } = useCourseAnalytics(
    courseId,
    dateRange,
  );

  const chartColors = useChartColors();
  const borderColor = useBorderColor();
  const mutedFg = useMutedFg();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-[140px]" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!data) return null;

  const analytics = data.data ?? data;

  const trendMap = new Map<
    string,
    { date: string; enrollments: number; views: number }
  >();
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
    a.date.localeCompare(b.date),
  );

  const revenueData = (analytics.revenue?.trend ?? []).map((r: any) => ({
    date: r.date,
    revenue: Number(r.revenue),
  }));

  const ratingDist = analytics.rating?.distribution ?? [];
  const ratingMap = new Map<number, number>();
  for (const r of ratingDist) {
    ratingMap.set(r.rating, r.count);
  }
  const totalReviews = analytics.rating?.totalReviews ?? 0;

  const growthRate = analytics.enrollmentGrowth?.growthRate;

  const allLessons: LessonPerformance[] = (analytics.sections ?? []).flatMap(
    (s: SectionAnalytics) => s.lessons,
  );
  const totalLessons = allLessons.length;

  const avgRating = analytics.rating?.avgRating ?? 0;
  const totalRevenue = analytics.revenue?.totalRevenue ?? 0;
  const periodRevenue = analytics.revenue?.periodRevenue ?? 0;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Phân tích khóa học</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isFetching
                ? "Đang cập nhật..."
                : "Theo dõi hiệu suất và hoạt động của khóa học"}
            </p>
          </div>
          <Select
            value={dateRange}
            onValueChange={(v) => setDateRange(v as DateRange)}
          >
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

        {/* ── KPI Cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Học viên</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {analytics.overview?.totalStudents?.toLocaleString(
                      "vi-VN",
                    ) ?? 0}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-2 shrink-0">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Lượt xem</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {analytics.overview?.totalViews?.toLocaleString(
                      "vi-VN",
                    ) ?? 0}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-2 shrink-0">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Hoàn thành</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {analytics.overview?.completionRate ?? 0}%
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-2 shrink-0">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Đánh giá</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-2xl font-bold tracking-tight">
                      {avgRating}
                    </p>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 mt-0.5" />
                    <span className="text-xs text-muted-foreground">/ 5</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {totalReviews} đánh giá
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-2 shrink-0">
                  <Star className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          </Card>
        </div>

        {/* ── Enrollment & Views Trend ─────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Xu hướng ghi danh & lượt xem
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={borderColor}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: mutedFg }}
                    tickFormatter={getDateAxisFormatter(dateRange)}
                    interval={getDateTickInterval(dateRange)}
                    stroke={mutedFg}
                    opacity={0.4}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: mutedFg }}
                    stroke={mutedFg}
                    opacity={0.4}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltipContent />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    name="Ghi danh"
                    stroke={chartColors[1]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    name="Lượt xem"
                    stroke={chartColors[3]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
                Chưa có dữ liệu xu hướng.
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Student Performance ──────────────────────────────── */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Hiệu suất học viên
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-xl font-bold mt-1">
                  {analytics.engagement?.activeStudents ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Complete</p>
                <p className="text-xl font-bold mt-1">
                  {analytics.engagement?.completedStudents ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-xl font-bold mt-1">
                  {analytics.engagement?.avgProgress ?? 0}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Lesson Performance ───────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Hiệu suất bài học
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {totalLessons} bài
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {allLessons.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-muted-foreground text-xs">
                        Bài học
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground text-xs text-right">
                        Bắt đầu
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground text-xs text-right">
                        Hoàn thành
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground text-xs text-right">
                        Drop-off
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLessons.slice(0, 10).map((lesson) => (
                      <tr
                        key={lesson.lessonId}
                        className="border-b last:border-0"
                      >
                        <td className="py-2.5 pr-4">
                          <p className="font-medium truncate max-w-[200px]">
                            {lesson.title}
                          </p>
                        </td>
                        <td className="py-2.5 text-right tabular-nums">
                          {lesson.totalStarted}
                        </td>
                        <td className="py-2.5 text-right tabular-nums">
                          {lesson.completed}
                        </td>
                        <td className="py-2.5 text-right">
                          {lesson.dropOffRate !== null ? (
                            <span
                              className={`tabular-nums ${
                                lesson.dropOffRate > 50
                                  ? "text-red-600 font-medium"
                                  : lesson.dropOffRate > 25
                                    ? "text-amber-600"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {lesson.dropOffRate}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allLessons.length > 10 && (
                  <div className="pt-3 text-center">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Xem tất cả {allLessons.length} bài học
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-sm text-muted-foreground">
                Chưa có dữ liệu bài học.
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Reviews + Revenue ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reviews */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Đánh giá</CardTitle>
            </CardHeader>
            <CardContent>
              {totalReviews > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold">{avgRating}</span>
                    <div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${
                              s <= Math.round(avgRating)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {totalReviews} đánh giá
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <RatingBar
                        key={star}
                        star={star}
                        count={ratingMap.get(star) ?? 0}
                        total={totalReviews}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs w-full justify-start px-0"
                    onClick={() => navigate(`/courses/${courseId}/reviews`)}
                  >
                    Xem tất cả đánh giá
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Chưa có đánh giá nào.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Coins className="h-4 w-4 text-muted-foreground" />
                Doanh thu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Tổng doanh thu
                  </p>
                  <p className="text-xl font-bold mt-0.5">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Từ khi bắt đầu bán
                  </p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    Doanh thu trong kỳ
                  </p>
                  <p className="text-xl font-bold mt-0.5">
                    {formatCurrency(periodRevenue)}
                  </p>
                  {growthRate !== null && growthRate !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      {growthRate >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={`text-[10px] font-medium ${growthRate >= 0 ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {Math.abs(growthRate)}% so với kỳ trước
                      </span>
                    </div>
                  )}
                </div>
                {revenueData.length > 0 && (
                  <div className="border-t pt-3">
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={revenueData}>
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 9, fill: mutedFg }}
                          tickFormatter={getDateAxisFormatter(dateRange)}
                          interval={getDateTickInterval(dateRange)}
                          stroke={mutedFg}
                          opacity={0.4}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Bar
                          dataKey="revenue"
                          fill={chartColors[1]}
                          radius={[3, 3, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs w-full justify-start px-0"
                  onClick={() => navigate(`/courses/${courseId}/analytics/revenue`)}
                >
                  Xem chi tiết doanh thu
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
