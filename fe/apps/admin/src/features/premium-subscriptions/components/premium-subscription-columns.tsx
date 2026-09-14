import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@fe/components/ui/badge";
import type { PremiumSubscription } from "../types/premium-subscription";
import { subscriptionStatusLabel, subscriptionStatusClassName } from "../types/premium-subscription";

const column = createColumnHelper<PremiumSubscription>();

export const premiumSubscriptionColumns = [
  column.accessor("user", {
    header: "Học viên",
    cell: (info) => info.getValue()?.name || "—",
  }),
  column.accessor("startedAt", {
    header: "Ngày bắt đầu",
    cell: (info) => {
      const v = info.getValue();
      if (!v) return "—";
      return new Date(v).toLocaleDateString("vi-VN");
    },
  }),
  column.accessor("expiredAt", {
    header: "Ngày hết hạn",
    cell: (info) => {
      const v = info.getValue();
      if (!v) return "—";
      return new Date(v).toLocaleDateString("vi-VN");
    },
  }),
  column.accessor("status", {
    header: "Trạng thái",
    cell: (info) => {
      const v = info.getValue();
      const label = subscriptionStatusLabel[v] || "Không rõ";
      const className = subscriptionStatusClassName[v] || "";
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
