import type { ColumnDef } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/components/common/data-table/data-table-features";
import type { Booking } from "@/features/bookings/types/booking";
import { getBookingStatusBadge } from "@/features/bookings/types/booking";
import { Badge } from "@fe/components/ui/badge";

export function createBookingColumns(): ColumnDef<DataTableFeatures, Booking>[] {
  return [
    {
      accessorKey: "studentName",
      header: "Học viên",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium line-clamp-1">
            {row.original.studentName}
          </span>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {row.original.studentEmail}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "bookingDate",
      header: "Ngày",
      cell: ({ row }) => {
        if (!row.original.bookingDate) return <span>—</span>;
        return (
          <span className="text-sm">
            {new Date(row.original.bookingDate).toLocaleDateString("vi-VN")}
          </span>
        );
      },
    },
    {
      accessorKey: "startTime",
      header: "Giờ bắt đầu",
      cell: ({ row }) => <span>{row.original.startTime}</span>,
    },
    {
      accessorKey: "endTime",
      header: "Giờ kết thúc",
      cell: ({ row }) => <span>{row.original.endTime}</span>,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const badge = getBookingStatusBadge(row.original);
        return (
          <Badge variant="outline" className={`${badge.className} border-0`}>
            {badge.label}
          </Badge>
        );
      },
    },
  ];
}
