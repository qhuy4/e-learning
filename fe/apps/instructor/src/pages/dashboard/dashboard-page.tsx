import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mascot } from "page-mascot";
import {
  DollarSign,
  TrendingUp,
  Users,
  Star,
  BookOpen,
  ArrowRight,
  Wallet,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetProfile } from "@/features/profile/hook/use-profile";
import { useRevenueSummary, useRevenueByCourse } from "@/features/revenue/hook/use-revenue";
import { useGetCourses } from "@/features/courses/hook/use-courses";
import { useStudents } from "@/features/students/hook/use-students";
import { useTeachingProfile } from "@/features/teaching-profile/hooks/use-teaching-profile";
import { useSkillProfile } from "@/features/skill-profile/hooks/use-skill-profile";
import { SkillScoreBar } from "@/features/skill-profile/components/skill-score-bar";
import { Card, CardContent } from "@fe/components/ui/card";
import { Badge } from "@fe/components/ui/badge";
import { Skeleton } from "@fe/components/ui/skeleton";
import { Button } from "@fe/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@fe/components/ui/table";

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: profileData } = useGetProfile();
  const { data: teachingProfile } = useTeachingProfile();
  const { data: skills, isLoading: skillsLoading } = useSkillProfile();
  const { data: summaryData, isLoading: summaryLoading } = useRevenueSummary();
  const { data: byCourseData, isLoading: courseLoading } = useRevenueByCourse({ page: 1, limit: 5 });
  const { data: allCourses } = useGetCourses({ page: 1, limit: 999 });
  const { data: recentEnrollments, isLoading: enrollmentsLoading } = useStudents({
    page: 1,
    limit: 8,
  });

  const profile = profileData?.data;
  const summary = summaryData?.data;
  const topCourses = (byCourseData?.data ?? []) as any[];
  const allCourseList = (allCourses?.data ?? []) as any[];
  const enrollments = (recentEnrollments?.data ?? []) as any[];

  const courseCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    allCourseList.forEach((c: any) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return counts;
  }, [allCourseList]);

  const firstName = profile?.profile?.firstName || profile?.name?.split(" ")[0] || "Giáo viên";
  const chartColor = useThemeColor("--chart-1");

  const stats = [
    {
      title: "Tổng doanh thu",
      value: summary ? formatCurrency(summary.totalRevenue) : "0",
      icon: DollarSign,
    },
    {
      title: "Đã kiếm được",
      value: summary ? formatCurrency(summary.totalEarned) : "0",
      icon: TrendingUp,
    },
    {
      title: "Chờ thanh toán",
      value: summary ? formatCurrency(summary.pendingPayout) : "0",
      icon: Wallet,
    },
    {
      title: "Học viên",
      value: summary?.totalStudents?.toLocaleString() ?? "0",
      icon: Users,
    },
    {
      title: "Đánh giá TB",
      value: summary?.avgRating ? Number(summary.avgRating).toFixed(1) : "0",
      icon: Star,
    },
    {
      title: "Khóa học",
      value: String(allCourseList.length),
      icon: BookOpen,
    },
  ];

  const courseStatusCards = [
    { status: 5, label: "Đã xuất bản", color: "text-green-600" },
    { status: 2, label: "Chờ duyệt", color: "text-yellow-600" },
    { status: 1, label: "Bản nháp", color: "text-muted-foreground" },
    { status: 4, label: "Bị từ chối", color: "text-red-600" },
  ];

  const chartData = topCourses.slice(0, 5).map((c: any) => ({
    name: c.courseTitle?.length > 20 ? c.courseTitle.slice(0, 20) + "..." : c.courseTitle,
    revenue: c.instructorShare,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div className="flex items-center gap-4">
        <Mascot
          directions="/mascots/redpanda-directions.webp"
          reactions="/mascots/redpanda-reactions.webp"
          size={120}
          label="Pi mascot"
        />
        <div>
          <h1 className="text-2xl font-bold">Xin chào, {firstName}!</h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan về hoạt động giảng dạy của bạn.
          </p>
          {teachingProfile && (
            <button
              type="button"
              onClick={() => navigate("/teaching-profile")}
              className="group mt-2 flex cursor-pointer items-center gap-2"
              title="Mở Hồ sơ giảng dạy"
            >
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${teachingProfile.completion.percent}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                Hồ sơ giảng dạy của bạn đã hoàn thành{" "}
                <span className="font-semibold text-foreground">
                  {teachingProfile.completion.percent}%
                </span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {summaryLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-24" />
              </div>
            ))
          : stats.map((stat) => (
              <div key={stat.title} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{stat.title}</span>
                  <div className={`rounded-lg p-1.5 ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-2 text-xl font-bold">{stat.value}</div>
              </div>
            ))}
      </div>

      {/* AI Skill Profile */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold">Hồ sơ kỹ năng AI</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigate("/skill-profile")}
            >
              Xem đánh giá chi tiết
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          {skillsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : !skills?.length ? (
            <p className="text-sm text-muted-foreground">
              Chưa có dữ liệu kỹ năng.
            </p>
          ) : (
            <>
              <div className="space-y-1">
                {skills.map((skill) => (
                  <SkillScoreBar
                    key={skill.id}
                    name={skill.name}
                    score={skill.score}
                    confidence={skill.confidence}
                    onClick={() => navigate("/skill-profile")}
                  />
                ))}
              </div>
              <p className="border-t pt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Score</span> = AI
                đánh giá ·{" "}
                <span className="font-medium text-foreground">Confidence</span> =
                độ chắc chắn ·{" "}
                <span className="font-medium text-foreground">Evidence</span> =
                dữ liệu nền — thêm bằng chứng tại trang Bằng chứng để AI tính
                lại.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Status Breakdown */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold">Trạng thái khóa học</h3>
            <div className="space-y-3">
              {courseStatusCards.map((cs) => (
                <div key={cs.status} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{cs.label}</span>
                  <span className={`text-sm font-bold ${cs.color}`}>
                    {courseCounts[cs.status] ?? 0}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-sm font-medium">Tổng cộng</span>
                <span className="text-sm font-bold">{allCourseList.length}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate("/courses")}
            >
              Xem tất cả khóa học
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Top Courses by Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold">Khóa học theo doanh thu</h3>
            {courseLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Chưa có doanh thu.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 0, right: 16 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]} fill={chartColor} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Enrollments */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Học viên gần đây</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigate("/students")}
            >
              Xem tất cả
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          {enrollmentsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có học viên nào.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Khóa học</TableHead>
                  <TableHead>Tiến độ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{e.userName}</p>
                        <p className="text-xs text-muted-foreground">{e.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {e.courseTitle}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${e.progress ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {e.progress ?? 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          e.status === 2
                            ? "default"
                            : e.status === 1
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[10px]"
                      >
                        {e.status === 2
                          ? "Hoàn thành"
                          : e.status === 1
                            ? "Đang học"
                            : "Chưa bắt đầu"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {e.enrolledAt
                        ? new Date(e.enrolledAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
