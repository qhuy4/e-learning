import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft, Coins, ArrowUpRight, ArrowDownRight, CalendarIcon } from "lucide-react";
import { useCourseAnalytics } from "@/features/analytics/hooks/use-analytics";
import {
  DATE_RANGE_OPTIONS,
  type DateRange,
} from "@/features/analytics/types/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@fe/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import { Button } from "@fe/components/ui/button";
import { Calendar } from "@fe/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@fe/components/ui/popover";
import type { DateRange as ReactDateRange } from "react-day-picker";

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

function formatDateVN(date: Date): string {
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function CourseRevenuePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [customRange, setCustomRange] = useState<ReactDateRange | undefined>(undefined);

  const customStartDate = customRange?.from
    ? customRange.from.toISOString().split("T")[0]
    : undefined;
  const customEndDate = customRange?.to
    ? customRange.to.toISOString().split("T")[0]
    : customRange?.from
      ? customRange.from.toISOString().split("T")[0]
      : undefined;

  const { data, isLoading, isFetching } = useCourseAnalytics(
    courseId,
    dateRange,
    customStartDate,
    customEndDate,
  );

  const borderColor = useThemeColor("--border");
  const mutedFg = useThemeColor("--muted-foreground");
  const chartColor = useThemeColor("--chart-2");

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-72" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!data) return null;

  const analytics = data.data ?? data;
  const totalRevenue = analytics.revenue?.totalRevenue ?? 0;
  const periodRevenue = analytics.revenue?.periodRevenue ?? 0;
  const growthRate = analytics.enrollmentGrowth?.growthRate;

  const revenueData = (analytics.revenue?.trend ?? []).map((r: any) => ({
    date: r.date,
    revenue: Number(r.revenue),
  }));

  const dateRangeLabel =
    DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ?? "";

  const handleDateRangeChange = (value: string) => {
    const range = value as DateRange;
    setDateRange(range);
    if (range !== "custom") {
      setCustomRange(undefined);
      setCalendarOpen(false);
    } else {
      setCalendarOpen(true);
    }
  };

  const handleCalendarSelect = (range: ReactDateRange | undefined) => {
    setCustomRange(range);
    if (range?.from) {
      setDateRange("custom");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Doanh thu khóa học</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isFetching ? "Đang cập nhật..." : "Dữ liệu doanh thu theo thời gian"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="h-9 min-w-[140px]">
              {dateRange === "custom" && customRange?.from
                ? `${formatDateVN(customRange.from)} - ${customRange.to ? formatDateVN(customRange.to) : "..."}`
                : dateRangeLabel}
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dateRange === "custom" && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm font-medium hover:bg-muted cursor-pointer">
                <CalendarIcon className="h-4 w-4" />
                Chọn ngày
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={customRange}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Custom range indicator */}
      {dateRange === "custom" && customRange?.from && (
        <Card className="bg-muted/30">
          <CardContent className="p-3 flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Khoảng thời gian:</span>
            <span className="font-medium">
              {formatDateVN(customRange.from)}
              {customRange.to ? ` - ${formatDateVN(customRange.to)}` : " - ..."}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Revenue summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tổng doanh thu</p>
              <p className="text-2xl font-bold tabular-nums">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Từ khi bắt đầu bán
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Doanh thu {dateRange === "custom" && customRange?.from ? "tùy chỉnh" : dateRangeLabel.toLowerCase()}
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {formatCurrency(periodRevenue)}
              </p>
              {growthRate !== null && growthRate !== undefined && (
                <div className="flex items-center gap-1">
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
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            Biểu đồ doanh thu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={borderColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: mutedFg }}
                  tickFormatter={getDateAxisFormatter(dateRange === "custom" ? "30d" : dateRange)}
                  interval={getDateTickInterval(dateRange === "custom" ? "30d" : dateRange)}
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
                  tickFormatter={(v) =>
                    v >= 1000000
                      ? `${(v / 1000000).toFixed(0)}tr`
                      : v >= 1000
                        ? `${(v / 1000).toFixed(0)}k`
                        : String(v)
                  }
                />
                <RechartsTooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                  }}
                />
                <Bar
                  dataKey="revenue"
                  name="Doanh thu"
                  fill={chartColor}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
              Chưa có dữ liệu doanh thu.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue table */}
      {revenueData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Chi tiết theo ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-muted-foreground text-xs">
                      Ngày
                    </th>
                    <th className="pb-2 font-medium text-muted-foreground text-xs text-right">
                      Doanh thu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((item) => (
                    <tr
                      key={item.date}
                      className="border-b last:border-0"
                    >
                      <td className="py-2.5">
                        {new Date(item.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-2.5 text-right font-medium tabular-nums">
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
