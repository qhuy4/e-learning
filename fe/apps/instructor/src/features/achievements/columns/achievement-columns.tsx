import type { ColumnDef } from "@tanstack/react-table";
import type { Achievement } from "../types/achievement";
import { achievementCriteriaLabel } from "../types/achievement";

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export function createAchievementColumns(): ColumnDef<Achievement>[] {
  return [
    {
      accessorKey: "icon",
      header: "Huy hiệu",
      cell: ({ row }) => (
        <span className="text-2xl">{row.original.icon || "🏆"}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Tên",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Danh mục",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.category || "—"}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => (
        <span className="text-muted-foreground line-clamp-1">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: "criteria",
      header: "Tiêu chí",
      cell: ({ row }) => (
        <span>{achievementCriteriaLabel[row.original.criteria]}</span>
      ),
    },
    {
      accessorKey: "threshold",
      header: "Yêu cầu",
      cell: ({ row }) => <span>{row.original.threshold}</span>,
    },
    {
      accessorKey: "earnedAt",
      header: "Ngày đạt",
      cell: ({ row }) => (
        <span className="text-sm">{formatDate(row.original.earnedAt)}</span>
      ),
    },
  ];
}
