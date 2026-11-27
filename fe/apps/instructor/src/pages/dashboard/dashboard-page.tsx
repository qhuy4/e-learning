import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { instructorApi } from "@/shared/lib/axios";
import { useNavigate } from "react-router";
import { Mascot } from "page-mascot";
import {
  DollarSign,
  TrendingUp,
  Users,
  BookOpen,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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
import { useGetCourses } from "@/features/courses/hook/use-courses";
import { useStudents } from "@/features/students/hook/use-students";
import { useTeachingProfile } from "@/features/teaching-profile/hooks/use-teaching-profile";
import { Card, CardContent } from "@fe/components/ui/card";
import { Badge } from "@fe/components/ui/badge";
import { Calendar } from "@fe/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@fe/components/ui/popover";
import { vi } from "date-fns/locale";
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

function localDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function dateValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function displayDate(value: string): string {
  return value ? value.split("-").reverse().join("/") : "Chọn ngày";
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
  const [period, setPeriod] = useState("30d");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [rangePickerOpen, setRangePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedRange, setAppliedRange] = useState<{ from: string; to: string } | null>(null);
  const customMode = period === "month" || period === "custom";
  const params = customMode ? { period: "custom", from: appliedRange?.from, to: appliedRange?.to } : { period };
  const rangeValid = fromDate !== "" && toDate !== "" && fromDate <= toDate;
  const applyRange = () => {
    if (period === "month" && /^\d{4}-\d{2}$/.test(selectedMonth)) {
      const [year, month] = selectedMonth.split("-").map(Number);
      const end = new Date(year, month, 0).getDate();
      setAppliedRange({ from: `${selectedMonth}-01`, to: `${selectedMonth}-${String(end).padStart(2, "0")}` });
    } else if (period === "custom" && rangeValid) {
      setAppliedRange({ from: fromDate, to: toDate });
    }
  };
  const { data: report, isLoading: reportLoading, isError: reportError, refetch: refetchReport } = useQuery({
    queryKey: ["instructor-dashboard-revenue", customMode ? "custom" : period, ...(customMode ? [appliedRange?.from, appliedRange?.to] : [])],
    enabled: !customMode || !!appliedRange,
    queryFn: async () => {
      const response = await instructorApi.get("/revenue/dashboard", { params });
      return response.data.data as { sharePct: number; summary: { gross: number; income: number; sales: number; estimated: number }; courses: { courseId: string; courseTitle: string; gross: number; income: number; sales: number }[]; trend: { date: string; gross: number; income: number }[] };
    },
  });
  const { data: lifetimeReport, isLoading: lifetimeLoading, isError: lifetimeError, refetch: refetchLifetime } = useQuery({
    queryKey: ["instructor-dashboard-revenue", "all"],
    queryFn: async () => {
      const response = await instructorApi.get("/revenue/dashboard", { params: { period: "all" } });
      return response.data.data as { sharePct: number; summary: { gross: number; income: number; estimated: number } };
    },
  });
  const { data: allCourses } = useGetCourses({ page: 1, limit: 999 });
  const { data: recentEnrollments, isLoading: enrollmentsLoading } = useStudents({
    page: 1,
    limit: 8,
  });

  const profile = profileData?.data;
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
    { title: "Doanh thu trong kỳ", value: report ? formatCurrency(report.summary.gross) : "—", icon: DollarSign },
    { title: "Thu nhập trong kỳ", value: report ? formatCurrency(report.summary.income) : "—", icon: TrendingUp },
    { title: "Lượt mua trong kỳ", value: report ? String(report.summary.sales) : "—", icon: Users },
    { title: "Khóa học hiện có", value: String(allCourseList.length), icon: BookOpen },
  ];

  const courseStatusCards = [
    { status: 5, label: "Đã xuất bản", color: "text-green-600" },
    { status: 2, label: "Chờ duyệt", color: "text-yellow-600" },
    { status: 1, label: "Bản nháp", color: "text-muted-foreground" },
    { status: 4, label: "Bị từ chối", color: "text-red-600" },
  ];


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

      <section className="space-y-3" aria-label="Tổng doanh thu toàn thời gian">
        <div><h2 className="text-lg font-semibold">Tổng tích lũy toàn thời gian</h2><p className="text-sm text-muted-foreground">Doanh thu khóa học từ các đơn thanh toán thành công, sau giảm giá.</p></div>
        {lifetimeError ? <div role="alert" className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">Không thể tải tổng tích lũy. <button className="underline" onClick={() => refetchLifetime()}>Thử lại</button></div> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card><CardContent className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="h-4 w-4" /> Tổng doanh thu khóa học</div>{lifetimeLoading ? <Skeleton className="mt-2 h-8 w-40" /> : <p className="mt-2 text-2xl font-bold">{lifetimeReport ? formatCurrency(lifetimeReport.summary.gross) : "—"}</p>}</CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4" /> Tổng thu nhập giảng viên</div>{lifetimeLoading ? <Skeleton className="mt-2 h-8 w-40" /> : <p className="mt-2 text-2xl font-bold">{lifetimeReport ? formatCurrency(lifetimeReport.summary.income) : "—"}</p>}</CardContent></Card>
        </div>}
        {lifetimeReport && lifetimeReport.summary.estimated > 0 && <p className="text-xs text-muted-foreground">Trong tổng thu nhập, {lifetimeReport.summary.estimated} lượt mua được ước tính theo tỷ lệ chia hiện tại {lifetimeReport.sharePct}% do chưa có bản ghi phân chia.</p>}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold">Thống kê khóa học</h2><p className="text-sm text-muted-foreground">Chỉ tính đơn hàng đã thanh toán; doanh thu sau giảm giá.</p></div>
        <label className="flex items-center gap-2 text-sm">Khoảng thời gian
          <select value={period} onChange={(e) => { setPeriod(e.target.value); setAppliedRange(null); }} className="rounded-md border bg-background px-3 py-2" aria-label="Khoảng thời gian thống kê">
            <option value="7d">7 ngày gần đây</option><option value="30d">30 ngày gần đây</option><option value="90d">90 ngày gần đây</option><option value="365d">365 ngày gần đây</option><option value="all">Toàn thời gian</option><option value="month">Chọn tháng</option><option value="custom">Tùy chọn ngày</option>
          </select>
        </label>
      </div>
      {customMode && <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-sm font-semibold">{period === "month" ? "Chọn tháng thống kê" : "Chọn khoảng thời gian"}</p>
            <p className="text-xs text-muted-foreground">{period === "month" ? "Chọn năm và tháng bạn muốn xem doanh thu." : "Chọn lần lượt ngày bắt đầu và ngày kết thúc trên lịch."}</p>
            {period === "month" ? (
              <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
                <PopoverTrigger className="mt-1 inline-flex h-11 min-w-52 items-center justify-between gap-4 rounded-lg border bg-background px-3 text-sm font-medium shadow-sm hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> Tháng {Number(selectedMonth.slice(5))} năm {selectedMonth.slice(0, 4)}</span><ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72 p-4">
                  <div className="mb-3 flex items-center justify-between"><button type="button" aria-label="Năm trước" onClick={() => setPickerYear(y => y - 1)} className="rounded-md p-2 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button><span className="font-semibold">Năm {pickerYear}</span><button type="button" aria-label="Năm sau" onClick={() => setPickerYear(y => y + 1)} className="rounded-md p-2 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button></div>
                  <div className="grid grid-cols-3 gap-2">{Array.from({ length: 12 }, (_, i) => { const value = `${pickerYear}-${String(i + 1).padStart(2, "0")}`; return <button key={value} type="button" aria-pressed={selectedMonth === value} onClick={() => { setSelectedMonth(value); setMonthPickerOpen(false); }} className={`rounded-lg px-2 py-2 text-sm font-medium transition-colors ${selectedMonth === value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Tháng {i + 1}</button>; })}</div>
                </PopoverContent>
              </Popover>
            ) : (
              <Popover open={rangePickerOpen} onOpenChange={setRangePickerOpen}>
                <PopoverTrigger className="mt-1 inline-flex min-h-11 w-full max-w-sm items-center justify-between gap-3 rounded-lg border bg-background px-3 text-left text-sm font-medium shadow-sm hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{displayDate(fromDate)} <span className="text-muted-foreground">—</span> {displayDate(toDate)}</span><ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] p-3">
                  <p className="px-2 pt-1 text-sm font-semibold">Chọn ngày bắt đầu và kết thúc</p>
                  <Calendar mode="range" locale={vi} captionLayout="dropdown" selected={fromDate ? { from: localDate(fromDate), to: localDate(toDate) } : undefined} onSelect={(range) => { setFromDate(range?.from ? dateValue(range.from) : ""); setToDate(range?.to ? dateValue(range.to) : ""); }} />
                  <div className="flex items-center justify-between gap-4 border-t px-2 pt-3"><span className="text-xs text-muted-foreground">{displayDate(fromDate)} — {displayDate(toDate)}</span><Button size="sm" disabled={!rangeValid} onClick={() => setRangePickerOpen(false)}>Xong</Button></div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <Button className="h-11" onClick={applyRange} disabled={period === "month" ? !selectedMonth : !rangeValid}>Xem thống kê</Button>
        </div>
        {appliedRange && <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">Đang xem: <span className="font-semibold text-foreground">{displayDate(appliedRange.from)} – {displayDate(appliedRange.to)}</span> · Bao gồm cả hai ngày</p>}
      </div>}
      {customMode && !appliedRange && <p className="text-sm text-muted-foreground">Chọn thời gian và nhấn Xem thống kê.</p>}
      {reportError && <div role="alert" className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">Không thể tải thống kê. <button className="underline" onClick={() => refetchReport()}>Thử lại</button></div>}
      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportLoading && (!customMode || appliedRange)
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-24" />
              </div>
            ))
          : stats.map((stat) => (
              <div key={stat.title} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{stat.title}</span>
                  <div className="rounded-lg p-1.5 bg-muted">
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="mt-2 text-xl font-bold">{stat.value}</div>
              </div>
            ))}
      </div>

      {report && <p className="text-xs text-muted-foreground">Thu nhập là phần chia cho giảng viên, chưa trừ chi phí cá nhân. {report.summary.estimated > 0 ? `${report.summary.estimated} lượt mua chưa có dữ liệu phân chia được ước tính theo tỷ lệ hiện tại ${report.sharePct}%.` : "Dữ liệu phân chia được ghi nhận theo từng giao dịch."} Không bao gồm đặt lịch 1–1.</p>}
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

        <Card className="lg:col-span-2">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold">Doanh thu theo thời gian</h3>
            {reportLoading ? <Skeleton className="h-48 w-full" /> : reportError ? <p className="text-sm text-muted-foreground">Không thể tải biểu đồ.</p> : !report?.trend.length ? <p className="text-sm text-muted-foreground text-center py-8">Chưa có giao dịch trong khoảng thời gian này.</p> : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={report.trend} margin={{ left: 4, right: 16 }}>
                  <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="gross" name="Doanh thu" fill={chartColor} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="income" name="Thu nhập giảng viên" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      <Card><CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold">Doanh thu theo khóa học <span className="font-normal text-muted-foreground">· tối đa 10 khóa học</span></h3>
        {reportLoading ? <Skeleton className="h-24 w-full" /> : reportError ? <p className="text-sm text-muted-foreground">Không thể tải danh sách.</p> : !report?.courses.length ? <p className="text-sm text-muted-foreground">Chưa có giao dịch trong khoảng thời gian này.</p> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Khóa học</TableHead><TableHead>Lượt mua</TableHead><TableHead>Doanh thu</TableHead><TableHead>Thu nhập giảng viên</TableHead></TableRow></TableHeader><TableBody>{report.courses.map(course => <TableRow key={course.courseId}><TableCell className="font-medium">{course.courseTitle}</TableCell><TableCell>{course.sales}</TableCell><TableCell>{formatCurrency(course.gross)}</TableCell><TableCell>{formatCurrency(course.income)}</TableCell></TableRow>)}</TableBody></Table></div>}
      </CardContent></Card>

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
