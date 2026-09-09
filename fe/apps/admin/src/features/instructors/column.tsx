"use client"

import {createColumnHelper} from "@tanstack/react-table"
import {ArrowUp, ArrowDown, ArrowUpDown, MoreHorizontal} from "lucide-react"
import type {HeaderContext} from "@tanstack/react-table"

import {type DataTableFeatures} from "@/components/common/data-table/data-table-features.ts"
import {Badge} from "@fe/components/ui/badge.tsx"
import {Button} from "@fe/components/ui/button.tsx"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@fe/components/ui/dropdown-menu.tsx"
import type {Instructor} from "@/features/instructors/type/instructor.ts";
import {Avatar, AvatarFallback, AvatarImage} from "@fe/components/ui/avatar.tsx";
import {
    approvalStatusLabel,
    approvalStatusClassName,
} from "@/features/instructors/constants/instructor.constants.ts";
import {
    userStatusLabel,
    statusClassName,
} from "@/features/users/constants/users.constants.ts";

const columnHelper = createColumnHelper<DataTableFeatures, Instructor>()

interface TableMetaType {
    sortBy?: string
    sortOrder?: "asc" | "desc"
    onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void
    onEdit?: (instructor: Instructor) => void
    onDelete?: (instructor: Instructor) => void
}

function initials(instructor: Instructor) {
    const fromProfile = `${instructor.profile?.headline?.[0] ?? ""}`
    if (fromProfile.trim()) return fromProfile.toUpperCase()
    return instructor.name.slice(0, 2).toUpperCase()
}

function SortHeader<TValue>({
    label,
    columnId,
    info,
}: {
    label: string
    columnId: string
    info: HeaderContext<DataTableFeatures, Instructor, TValue>
}) {
    const meta = info.table.options.meta as TableMetaType | undefined
    const isSorted = meta?.sortBy === columnId
    const sortOrder = isSorted ? meta?.sortOrder : null

    return (
        <button
            type="button"
            className="flex items-center gap-1 cursor-pointer select-none hover:text-foreground font-medium text-left bg-transparent border-none p-0 outline-none"
            onClick={(e) => {
                e.stopPropagation()
                const nextOrder = sortOrder === "asc" ? "desc" : "asc"
                meta?.onSortChange?.(columnId, nextOrder)
            }}
        >
            <span>{label}</span>
            {sortOrder === "asc" ? (
                <ArrowUp className="h-3.5 w-3.5 ml-1"/>
            ) : sortOrder === "desc" ? (
                <ArrowDown className="h-3.5 w-3.5 ml-1"/>
            ) : (
                <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-muted-foreground/30"/>
            )}
        </button>
    )
}

function formatDate(date: string | null) {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

export function createInstructorColumns() {
    return columnHelper.columns([
        columnHelper.accessor("name", {
            header: (info) => <SortHeader label="Giảng viên" columnId="name" info={info}/>,
            cell: (info) => {
                const instructor = info.row.original
                return (
                    <div className="flex items-center gap-3 min-w-40">
                        <Avatar size="sm">
                            {instructor.profile?.headline ? (
                                <AvatarImage src="" alt=""/>
                            ) : null}
                            <AvatarFallback>{initials(instructor)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div className="truncate font-medium">{instructor.name}</div>
                            <div className="truncate text-xs text-muted-foreground">
                                {instructor.email}
                            </div>
                        </div>
                    </div>
                )
            },
        }),
        columnHelper.accessor("status", {
            header: (info) => <SortHeader label="Trạng thái" columnId="status" info={info}/>,
            cell: (info) => {
                const status = info.getValue()
                return (
                    <Badge className={statusClassName[status]}>
                        {userStatusLabel[status]}
                    </Badge>
                )
            },
        }),
        columnHelper.accessor("profile.approvalStatus", {
            id: "approvalStatus",
            header: (info) => <SortHeader label="Duyệt hồ sơ" columnId="approvalStatus" info={info}/>,
            cell: (info) => {
                const approvalStatus = info.getValue()
                if (!approvalStatus) return <span className="text-muted-foreground">—</span>
                return (
                    <Badge className={approvalStatusClassName[approvalStatus]}>
                        {approvalStatusLabel[approvalStatus]}
                    </Badge>
                )
            },
        }),
        columnHelper.accessor("profile.approvedAt", {
            id: "approvedAt",
            header: (info) => <SortHeader label="Ngày duyệt" columnId="approvedAt" info={info}/>,
            cell: (info) => {
                const approvedAt = info.getValue()
                return (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(approvedAt)}
                    </span>
                )
            },
        }),
        columnHelper.display({
            id: "actions",
            header: () => <span className="sr-only">Thao tác</span>,
            cell: (info) => {
                const instructor = info.row.original
                const meta = info.table.options.meta as TableMetaType | undefined
                return (
                    <div
                        className="flex justify-end"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" size="icon-sm" aria-label="Open actions"/>
                                }
                            >
                                <MoreHorizontal className="size-4"/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => meta?.onEdit?.(instructor)}>
                                    Sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => meta?.onDelete?.(instructor)}
                                >
                                    Xóa
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        }),
    ])
}
