import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/components/common/data-table/data-table-features";
import { Badge } from "@fe/components/ui/badge";
import type { ReviewReport } from "../types/review-report";
import {
  reviewReportStatusLabel,
  reviewReportStatusClassName,
} from "../types/review-report";

const column = createColumnHelper<DataTableFeatures, ReviewReport>();

export const reviewReportColumns = [
  column.accessor("review.course", {
    header: "Khóa học",
    cell: (info) => info.getValue()?.title || "—",
  }),
  column.accessor("reporter.name", {
    header: "Người báo cáo",
    cell: (info) => info.getValue() || "—",
  }),
  column.accessor("reason", {
    header: "Lý do",
    cell: (info) => {
      const v = info.getValue();
      if (!v) return "—";
      return v.length > 50 ? v.substring(0, 50) + "..." : v;
    },
  }),
  column.accessor("review.rating", {
    header: "Đánh giá",
    cell: (info) => {
      const rating = info.getValue();
      if (!rating) return "—";
      return "⭐".repeat(rating);
    },
  }),
  column.accessor("status", {
    header: "Trạng thái",
    cell: (info) => {
      const status = info.getValue() as keyof typeof reviewReportStatusLabel;
      const label = reviewReportStatusLabel[status];
      const className = reviewReportStatusClassName[status];
      return <Badge variant="outline" className={className}>{label}</Badge>;
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
