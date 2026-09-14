import { Badge } from "@fe/components/ui/badge.tsx"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@fe/components/ui/card.tsx"
import { TrendingUpIcon, Users, BookOpen, DollarSign, ShoppingCart } from "lucide-react"
import { useDashboardStats } from "@/features/dashboard/use-dashboard"

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export function SectionCards() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              <div className="h-8 bg-muted rounded w-32 animate-pulse mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      description: "Tổng người dùng",
      value: stats?.totalUsers?.toLocaleString() ?? "0",
      icon: Users,
      trend: "+12.5%",
      footer: "Người dùng đã đăng ký",
    },
    {
      description: "Khóa học",
      value: stats?.totalCourses?.toLocaleString() ?? "0",
      icon: BookOpen,
      trend: "+5%",
      footer: "Khóa học trên hệ thống",
    },
    {
      description: "Doanh thu",
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      trend: "+18.2%",
      footer: "Tổng doanh thu",
    },
    {
      description: "Đơn hàng",
      value: stats?.totalOrders?.toLocaleString() ?? "0",
      icon: ShoppingCart,
      trend: "+8.1%",
      footer: `${stats?.totalEnrollments ?? 0} học viên đã ghi danh`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => (
        <Card key={card.description} className="@container/card">
          <CardHeader>
            <CardDescription>{card.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingUpIcon />
                {card.trend}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.footer}
              <card.icon className="size-4" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
