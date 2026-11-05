"use client"

import {createColumnHelper} from "@tanstack/react-table"
import {ArrowUp, ArrowDown, ArrowUpDown} from "lucide-react"
import type {HeaderContext} from "@tanstack/react-table"

import {type DataTableFeatures} from "@/components/common/data-table/data-table-features.ts"
import {Badge} from "@fe/components/ui/badge.tsx"
import type {Student} from "@/features/students/types/student.ts";
import {Avatar, AvatarFallback, AvatarImage} from "@fe/components/ui/avatar.tsx";
import {
    userStatusLabel,
    statusClassName,
} from "@/features/users/constants/users.constants.ts";

const columnHelper = createColumnHelper<DataTableFeatures, Student>()

interface TableMetaType {
    sortBy?: string
    sortOrder?: "asc" | "desc"
    onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void
    onEdit?: (student: Student) => void
    onDelete?: (student: Student) => void
}

function SortHeader<TValue>({
    label,
    columnId,
    info,
}: {
    label: string
    columnId: string
    info: HeaderContext<DataTableFeatures, Student, TValue>
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

function formatDate(date: Date | string | null) {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

export function createStudentColumns() {
    return columnHelper.columns([
        columnHelper.accessor("name", {
            header: (info) => <SortHeader label="Học viên" columnId="name" info={info}/>,
            cell: (info) => {
                const student = info.row.original
                return (
                    <div className="flex items-center gap-3 min-w-40">
                        <Avatar size="sm">
                            {student.profile?.avatarUrl ? (
                                <AvatarImage src={student.profile.avatarUrl} alt=""/>
                            ) : null}
                            <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div className="truncate font-medium">{student.name}</div>
                            <div className="truncate text-xs text-muted-foreground">
                                {student.email}
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
        columnHelper.accessor("createdAt", {
            header: (info) => <SortHeader label="Ngày tạo" columnId="createdAt" info={info}/>,
            cell: (info) => {
                const createdAt = info.getValue()
                return (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(createdAt)}
                    </span>
                )
            },
        }),
    ])
}
