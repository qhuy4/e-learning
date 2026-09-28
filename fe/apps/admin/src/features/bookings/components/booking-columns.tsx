import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@fe/components/ui/badge";
import { bookingStatusLabel, bookingStatusColor, type Booking } from "../types/booking";
import type { DataTableFeatures } from "@/components/common/data-table/data-table-features";

const column = createColumnHelper<DataTableFeatures, Booking>();

export const bookingColumns = [
  column.accessor("studentName", {
    header: "Học viên",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  column.accessor("instructorName", {
    header: "Giảng viên",
    cell: (info) => <span>{info.getValue()}</span>,
  }),
  column.accessor("bookingDate", {
    header: "Ngày",
    cell: (info) => {
      const v = info.getValue();
      if (!v) return "—";
      return new Date(v).toLocaleDateString("vi-VN");
    },
  }),
  column.accessor("startTime", {
    header: "Giờ bắt đầu",
    cell: (info) => <span>{info.getValue()}</span>,
  }),
  column.accessor("endTime", {
    header: "Giờ kết thúc",
    cell: (info) => <span>{info.getValue()}</span>,
  }),
  column.accessor("status", {
    header: "Trạng thái",
    cell: (info) => {
      const status = info.getValue() as Booking["status"];
      return (
        <Badge className={bookingStatusColor[status]}>
          {bookingStatusLabel[status]}
        </Badge>
      );
    },
  }),
  column.accessor("createdAt", {
    header: "Ngày tạo",
    cell: (info) => {
      const v = info.getValue();
      if (!v) return "—";
      return new Date(v).toLocaleDateString("vi-VN");
    },
  }),
];
