import type { ColumnDef } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/components/common/data-table/data-table-features";
import type { InstructorEnrollment } from "@/features/students/types/student";
import { ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUS_CLASSES } from "@/features/students/types/student";
import { Badge } from "@fe/components/ui/badge";

export function createStudentColumns(): ColumnDef<DataTableFeatures, InstructorEnrollment>[] {
  return [
    {
      accessorKey: "userName",
      header: "Học viên",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium line-clamp-1">{row.original.userName}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">{row.original.userEmail}</span>
        </div>
      ),
    },
    {
      accessorKey: "courseTitle",
      header: "Khóa học",
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[200px]">{row.original.courseTitle}</span>
      ),
    },
    {
      accessorKey: "progress",
      header: "Tiến độ",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${row.original.progress}%` }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums w-8 text-right">{row.original.progress}%</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const label = ENROLLMENT_STATUS_LABELS[row.original.status] ?? "—";
        const cls = ENROLLMENT_STATUS_CLASSES[row.original.status] ?? "";
        return (
          <Badge variant="outline" className={`${cls} border-0`}>
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "enrolledAt",
      header: "Ngày đăng ký",
      cell: ({ row }) => {
        if (!row.original.enrolledAt) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm">
            {new Date(row.original.enrolledAt).toLocaleDateString("vi-VN")}
          </span>
        );
      },
    },
  ];
}
