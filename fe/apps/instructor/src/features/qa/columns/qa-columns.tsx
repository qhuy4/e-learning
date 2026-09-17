import type { ColumnDef } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/components/common/data-table/data-table-features";
import type { Question } from "@/features/qa/types/qa";
import { QUESTION_STATUS_LABELS, QUESTION_STATUS_CLASSES } from "@/features/qa/types/qa";
import { Badge } from "@fe/components/ui/badge";

export function createQuestionColumns(): ColumnDef<DataTableFeatures, Question>[] {
  return [
    {
      accessorKey: "content",
      header: "Câu hỏi",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 max-w-[400px]">
          <span className="font-medium line-clamp-2">{row.original.content}</span>
          <span className="text-xs text-muted-foreground">
            bởi {row.original.user?.name ?? "—"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "course",
      header: "Khóa học",
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[200px]">{row.original.course?.title ?? "—"}</span>
      ),
    },
    {
      accessorKey: "answerCount",
      header: "Trả lời",
      cell: ({ row }) => (
        <Badge variant="outline" className="border-0">
          {row.original.answerCount}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const label = QUESTION_STATUS_LABELS[row.original.status] ?? "—";
        const cls = QUESTION_STATUS_CLASSES[row.original.status] ?? "";
        return (
          <Badge variant="outline" className={`${cls} border-0`}>
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => {
        if (!row.original.createdAt) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm">
            {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
          </span>
        );
      },
    },
  ];
}
