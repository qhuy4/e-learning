import type { ColumnDef } from "@tanstack/react-table";
import type { RevenueByCourse } from "../types/revenue";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export const revenueByCourseColumns: ColumnDef<RevenueByCourse, any>[] = [
  {
    accessorKey: "courseTitle",
    header: "Khóa học",
    cell: ({ row }) => {
      const thumbnail = row.original.courseThumbnail;
      const title = row.original.courseTitle;
      return (
        <div className="flex items-center gap-3">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-10 w-14 rounded object-cover"
            />
          ) : (
            <div className="h-10 w-14 rounded bg-muted" />
          )}
          <span className="font-medium line-clamp-1">{title}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "enrollmentCount",
    header: "Học viên",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.enrollmentCount}
      </span>
    ),
  },
  {
    accessorKey: "totalRevenue",
    header: "Doanh thu",
    cell: ({ row }) => (
      <span className="font-medium">
        {formatCurrency(row.original.totalRevenue)}
      </span>
    ),
  },
  {
    accessorKey: "instructorShare",
    header: "Phân chia",
    cell: ({ row }) => (
      <span className="font-medium text-green-600">
        {formatCurrency(row.original.instructorShare)}
      </span>
    ),
  },
  {
    accessorKey: "revenueSharePct",
    header: "Tỷ lệ",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.revenueSharePct}%
      </span>
    ),
  },
];
