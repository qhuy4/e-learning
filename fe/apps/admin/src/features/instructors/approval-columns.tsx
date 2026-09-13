"use client"

import {createColumnHelper} from "@tanstack/react-table"

import {type DataTableFeatures} from "@/components/common/data-table/data-table-features.ts"
import type {PendingInstructorProfile} from "@/features/instructors/type/pending-instructor.ts"
import {Badge} from "@fe/components/ui/badge.tsx"
import {Button} from "@fe/components/ui/button.tsx"

const columnHelper = createColumnHelper<DataTableFeatures, PendingInstructorProfile>()

interface ApprovalTableMeta {
  onView?: (profile: PendingInstructorProfile) => void
  onApprove?: (profileId: number) => void
  reviewing?: boolean
}

function approvalStatus(profile: PendingInstructorProfile) {
  const statuses: Record<number, {label: string; className: string}> = {
    1: {label: "Chờ duyệt (PENDING)", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"},
    2: {label: "Đã duyệt (APPROVED)", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"},
    3: {label: "Đã từ chối (REJECTED)", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"},
  }
  const status = statuses[profile.approvalStatus]
  return status ? <Badge className={status.className}>{status.label}</Badge> : "—"
}

export function createInstructorApprovalColumns() {
  return columnHelper.columns([
    columnHelper.accessor("user.name", {
      id: "instructor",
      header: "Giảng viên",
      cell: (info) => {
        const profile = info.row.original
        return (
          <div className="min-w-44">
            <div className="font-semibold">{profile.user?.name || `User #${profile.userId}`}</div>
            <div className="text-xs text-muted-foreground">{profile.user?.email}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Ngày nộp: {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
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
    columnHelper.accessor("kyc.kycStatus", {
      id: "kycStatus",
      header: "Kết quả eKYC (AI)",
      cell: (info) => {
        const kyc = info.row.original.kyc
        if (!kyc) return <span className="text-xs italic text-muted-foreground">Chưa có eKYC</span>

        const badge = kyc.kycStatus === 2
          ? {label: "✓ Verified (AI Pass)", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"}
          : kyc.kycStatus === 4
            ? {label: "⚠ Cần đối soát thủ công", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"}
            : {label: "✕ AI Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}

        return (
          <div className="space-y-1">
            <Badge className={badge.className}>{badge.label}</Badge>
            <div className="text-xs text-muted-foreground">CCCD: <span className="font-mono">{kyc.identityNumber}</span></div>
          </div>
        )
      },
    }),
    columnHelper.accessor("certificates", {
      header: "Bằng cấp",
      cell: (info) => <Badge variant="secondary">🎓 {info.getValue().length} chứng chỉ</Badge>,
    }),
    columnHelper.accessor("approvalStatus", {
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
          <div className="flex min-w-48 justify-end gap-2" onClick={(event) => event.stopPropagation()}>
            <Button variant="secondary" size="sm" onClick={() => meta?.onView?.(profile)}>
              Chi tiết & Đối soát
            </Button>
            {profile.approvalStatus === 1 && (
              <Button size="sm" disabled={meta?.reviewing} onClick={() => meta?.onApprove?.(profile.profileId)}>
                Duyệt
              </Button>
            )}
          </div>
        )
      },
    }),
  ])
}
