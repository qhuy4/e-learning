import { useState } from "react";
import { DollarSign, TrendingUp, Star } from "lucide-react";
import { DataTable } from "@/components/common/data-table/data-table";
import { revenueByCourseColumns } from "@/features/revenue/columns/revenue-columns";
import { useRevenueSummary, useRevenueByCourse } from "@/features/revenue/hook/use-revenue";
import { Skeleton } from "@fe/components/ui/skeleton";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function RevenuePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: summaryData, isLoading: summaryLoading } = useRevenueSummary();
  const { data: byCourseData, isLoading: byCourseLoading } = useRevenueByCourse({ page, limit: pageSize });

  const summary = summaryData?.data;

  const stats = [
    {
      title: "Tổng doanh thu",
      value: summary ? formatCurrency(summary.totalRevenue) : "0",
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Đã kiếm được",
      value: summary ? formatCurrency(summary.totalEarned) : "0",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Đang chờ thanh toán",
      value: summary ? formatCurrency(summary.pendingPayout) : "0",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Tỷ lệ chia sẻ",
      value: summary ? `${summary.revenueSharePct}%` : "0%",
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const meta = byCourseData?.meta;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Doanh thu</h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi doanh thu và thanh toán.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-32" />
              </div>
            ))
          : stats.map((stat) => (
              <div key={stat.title} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {stat.title}
                  </span>
                  <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Doanh thu theo khóa học</h2>
        <DataTable
          columns={revenueByCourseColumns}
          data={byCourseData?.data ?? []}
          page={page}
          pageSize={pageSize}
          total={meta?.total ?? 0}
          totalPages={meta?.totalPages ?? 0}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          isLoading={byCourseLoading}
          texts={{
            searchPlaceholder: "Tìm khóa học...",
            noResults: "Chưa có khóa học nào",
          }}
        />
      </div>
    </div>
  );
}
