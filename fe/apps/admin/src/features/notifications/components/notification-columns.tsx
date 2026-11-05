import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/components/common/data-table/data-table-features";
import { Badge } from "@fe/components/ui/badge";
import type { Notification } from "../types/notification";

const column = createColumnHelper<DataTableFeatures, Notification>();

const typeLabels: Record<string, string> = {
  "course.approved": "Khóa học được duyệt",
  "course.rejected": "Khóa học bị từ chối",
  "order.paid": "Đơn hàng đã thanh toán",
  "order.failed": "Đơn hàng thất bại",
  "enrollment.completed": "Hoàn thành khóa học",
  "certificate.issued": "Cấp chứng chỉ",
  "review.created": "Đánh giá mới",
  "review.reported": "Báo cáo đánh giá",
  "instructor.approved": "Giảng viên được duyệt",
  "instructor.rejected": "Giảng viên bị từ chối",
};

const typeClassName: Record<string, string> = {
  "course.approved": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "course.rejected": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "order.paid": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "order.failed": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "enrollment.completed": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "certificate.issued": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "review.created": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "review.reported": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "instructor.approved": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "instructor.rejected": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const notificationColumns = [
  column.accessor("isRead", {
    header: "",
    cell: (info) => {
      const v = info.getValue();
      return v ? null : <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />;
    },
  }),
  column.accessor("type", {
    header: "Loại",
    cell: (info) => {
      const v = info.getValue();
      const label = typeLabels[v] || v;
      const className = typeClassName[v] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
      return <Badge variant="outline" className={className}>{label}</Badge>;
    },
  }),
  column.accessor("title", {
    header: "Tiêu đề",
    cell: (info) => info.getValue() || "—",
  }),
  column.accessor("body", {
    header: "Nội dung",
    cell: (info) => {
      const v = info.getValue();
      if (!v) return "—";
      return v.length > 60 ? v.substring(0, 60) + "..." : v;
    },
  }),
  column.accessor("user", {
    header: "Người nhận",
    cell: (info) => info.getValue()?.name || "—",
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

export { typeLabels, typeClassName };
