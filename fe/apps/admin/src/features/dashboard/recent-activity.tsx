import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fe/components/ui/card.tsx"
import { Badge } from "@fe/components/ui/badge.tsx"
import { useDashboardStats } from "@/features/dashboard/use-dashboard"

const orderStatusMap: Record<number, { label: string; className: string }> = {
  0: { label: "Chờ thanh toán", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  1: { label: "Đã thanh toán", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  2: { label: "Thất bại", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export function RecentActivity() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded w-32 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-10 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
          <CardDescription>5 đơn hàng mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
            <p className="text-sm text-muted-foreground">Chưa có đơn hàng.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => {
                const status = orderStatusMap[order.status] || { label: "Không rõ", className: "" };
                return (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{order.orderCode}</p>
                      <p className="text-xs text-muted-foreground">{order.userName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={status.className}>{status.label}</Badge>
                      <span className="text-sm font-medium">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ghi danh gần đây</CardTitle>
          <CardDescription>5 ghi danh mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          {(!stats?.recentEnrollments || stats.recentEnrollments.length === 0) ? (
            <p className="text-sm text-muted-foreground">Chưa có ghi danh.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{enrollment.userName}</p>
                    <p className="text-xs text-muted-foreground">{enrollment.courseTitle}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(enrollment.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
