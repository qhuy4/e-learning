"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { useIsMobile } from "@fe/hooks/use-mobile.ts"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fe/components/ui/card.tsx"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@fe/components/ui/chart.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select.tsx"
import { Calendar } from "@fe/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@fe/components/ui/popover"
import { Button } from "@fe/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { useDashboardStats } from "@/features/dashboard/use-dashboard"
import { cn } from "@fe/lib/utils"

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const timeOptions = [
  { value: "90d", label: "6 tháng" },
  { value: "30d", label: "30 ngày" },
  { value: "7d", label: "7 ngày" },
  { value: "custom", label: "Tùy chỉnh" },
]

function getTimeParams(timeRange: string, dateRange?: DateRange) {
  if (timeRange === "custom" && dateRange?.from) {
    const from = format(dateRange.from, "yyyy-MM-dd")
    const to = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : from
    return { from, to }
  }
  const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 }
  const days = daysMap[timeRange] ?? 90
  const now = new Date()
  const from = format(new Date(now.getFullYear(), now.getMonth() - Math.ceil(days / 30) - 1, 1), "yyyy-MM-dd")
  const to = format(now, "yyyy-MM-dd")
  return { from, to }
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
  const [calendarOpen, setCalendarOpen] = React.useState(false)

  const timeParams = React.useMemo(() => getTimeParams(timeRange, dateRange), [timeRange, dateRange])
  const { data: stats } = useDashboardStats(timeParams)

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const chartData = React.useMemo(() => {
    if (!stats?.revenueByMonth) return []
    return stats.revenueByMonth.map((item) => ({
      date: item.month,
      revenue: Number(item.revenue),
    }))
  }, [stats?.revenueByMonth])

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    if (value === "custom") {
      if (!dateRange) {
        const now = new Date()
        setDateRange({ from: now, to: now })
      }
      setCalendarOpen(true)
    } else {
      setCalendarOpen(false)
    }
  }

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range)
    }
  }

  const displayLabel = React.useMemo(() => {
    if (timeRange === "custom" && dateRange?.from) {
      const from = format(dateRange.from, "dd/MM/yyyy")
      const to = dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : from
      return `${from} - ${to}`
    }
    return timeOptions.find((o) => o.value === timeRange)?.label ?? "6 tháng"
  }, [timeRange, dateRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Doanh thu theo tháng</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Doanh thu theo thời gian
          </span>
          <span className="@[540px]/card:hidden">Theo thời gian</span>
        </CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Thời gian:</span>
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue>
                  {timeOptions.find((o) => o.value === timeRange)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {timeRange === "custom" && (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className={cn("gap-2", dateRange?.from && "border-primary")}
                    />
                  }
                >
                  <CalendarIcon className="h-4 w-4" />
                  {displayLabel}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleCalendarSelect}
                    defaultMonth={dateRange?.from}
                    numberOfMonths={isMobile ? 1 : 2}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value + "-01")
                return date.toLocaleDateString("vi-VN", {
                  month: "short",
                  year: "2-digit",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value + "-01").toLocaleDateString("vi-VN", {
                      month: "long",
                      year: "numeric",
                    })
                  }}
                  formatter={(value) => [
                    new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(Number(value)),
                    "Doanh thu",
                  ]}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
