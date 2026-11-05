"use client"

import {createColumnHelper} from "@tanstack/react-table"

import {type DataTableFeatures} from "@/components/common/data-table/data-table-features.ts"
import type {PendingInstructorProfile} from "@/features/instructors/type/pending-instructor.ts"
import {Badge} from "@fe/components/ui/badge.tsx"
import {Button} from "@fe/components/ui/button.tsx"

const columnHelper = createColumnHelper<DataTableFeatures, PendingInstructorProfile>()

interface ApprovalTableMeta {
  onView?: (profile: PendingInstructorProfile) => void
}

const STATUS_LABELS: Record<
  string,
  { label: string; variant: "outline" | "secondary" | "default" | "destructive" }
> = {
  PENDING_SUBMISSION: { label: "Chờ bổ sung", variant: "secondary" },
  PENDING_INFORMATION: { label: "Cần bổ sung", variant: "secondary" },
  PENDING_REVIEW: { label: "Chờ duyệt", variant: "outline" },
  APPROVED: { label: "Đã duyệt", variant: "default" },
  REJECTED: { label: "Đã từ chối", variant: "destructive" },
}

function approvalStatus(profile: PendingInstructorProfile) {
  const status = STATUS_LABELS[profile.status]
  return status ? (
    <Badge variant={status.variant}>{status.label}</Badge>
  ) : (
    "-"
  )
}

export function createInstructorApprovalColumns() {
  return columnHelper.columns([
    columnHelper.accessor("fullName", {
      id: "instructor",
      header: "Giảng viên",
      cell: (info) => {
        const profile = info.row.original
        return (
          <div className="min-w-44">
            <div className="font-semibold">{profile.fullName || profile.email}</div>
            <div className="text-xs text-muted-foreground">{profile.email}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Ngày nộp: {new Date(profile.submittedAt || profile.createdAt).toLocaleDateString("vi-VN")}
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor("headline", {
      header: "Chuyên môn / Bio",
      cell: (info) => {
        const profile = info.row.original
        return (
          <div className="max-w-72">
            <div className="truncate font-medium">{profile.headline || "Chưa cập nhật headline"}</div>
            <div className="truncate text-xs text-muted-foreground">{profile.bio || "Chưa có tiểu sử"}</div>
          </div>
        )
      },
    }),
    columnHelper.accessor("certificateCount", {
      header: "Bằng cấp",
      cell: (info) => <Badge variant="secondary">{info.getValue()} chứng chỉ</Badge>,
    }),
    columnHelper.accessor("status", {
      header: "Trạng thái",
      cell: (info) => approvalStatus(info.row.original),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right">Thao tác</div>,
      cell: (info) => {
        const profile = info.row.original
        const meta = info.table.options.meta as ApprovalTableMeta | undefined
        return (
          <div
            className="flex justify-end whitespace-nowrap"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => meta?.onView?.(profile)}
            >
              Xem & xử lý
            </Button>
          </div>
        )
      },
    }),
  ])
}
