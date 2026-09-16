import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@fe/components/ui/badge";
import type { Achievement, AchievementCriteria } from "../types/achievement";
import { achievementCriteriaLabel } from "../types/achievement";
import type { DataTableFeatures } from "@/components/common/data-table/data-table-features";

const column = createColumnHelper<DataTableFeatures, Achievement>();

export const achievementColumns = [
  column.accessor("name", {
    header: "Tên thành tựu",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  column.accessor("criteria", {
    header: "Loại",
    cell: (info) => {
      const criteria = info.getValue() as AchievementCriteria;
      return <span>{achievementCriteriaLabel[criteria] ?? criteria}</span>;
    },
  }),
  column.accessor("threshold", {
    header: "Ngưỡng",
    cell: (info) => <span>{info.getValue()}</span>,
  }),
  column.accessor("earnedCount", {
    header: "Đạt được",
    cell: (info) => <span>{info.getValue() ?? 0}</span>,
  }),
  column.accessor("isActive", {
    header: "Trạng thái",
    cell: (info) => {
      const isActive = Boolean(info.getValue());
      return (
        <Badge className={isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {isActive ? "Đang kích hoạt" : "Tạm dừng"}
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
