"use client"

import {createColumnHelper} from "@tanstack/react-table"
import {ArrowUp, ArrowDown, ArrowUpDown} from "lucide-react"
import type {HeaderContext} from "@tanstack/react-table"

import {type DataTableFeatures} from "@/components/common/data-table/data-table-features.ts"
import {Badge} from "@fe/components/ui/badge.tsx"
import {CourseStatus, CourseLevel} from "@/features/courses/types/admin-course";

const columnHelper = createColumnHelper<DataTableFeatures, any>()

const statusMap: Record<number, {label: string; className: string}> = {
    0: {label: "Bản nháp", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"},
    [CourseStatus.DRAFT]: {label: "Bản nháp", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"},
    [CourseStatus.PENDING_REVIEW]: {label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"},
    [CourseStatus.APPROVED]: {label: "Đã duyệt", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"},
    [CourseStatus.REJECTED]: {label: "Bị từ chối", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"},
    [CourseStatus.PUBLISHED]: {label: "Đã xuất bản", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"},
    [CourseStatus.ARCHIVED]: {label: "Đã lưu trữ", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"},
}

const levelMap: Record<number, string> = {
    [CourseLevel.BEGINNER]: "Cơ bản",
    [CourseLevel.INTERMEDIATE]: "Trung bình",
    [CourseLevel.ADVANCED]: "Nâng cao",
}

interface TableMetaType {
    sortBy?: string
    sortOrder?: "asc" | "desc"
    onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void
}

function SortHeader<TValue>({
    label,
    columnId,
    info,
}: {
    label: string
    columnId: string
    info: HeaderContext<DataTableFeatures, any, TValue>
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

export function createCourseColumns() {
    return columnHelper.columns([
        columnHelper.accessor("title", {
            header: (info) => <SortHeader label="Tiêu đề" columnId="title" info={info}/>,
            cell: (info) => (
                <div className="max-w-[300px] truncate font-medium">{info.getValue()}</div>
            ),
        }),
        columnHelper.accessor("level", {
            header: (info) => <SortHeader label="Trình độ" columnId="level" info={info}/>,
            cell: (info) => (
                <span>{levelMap[Number(info.getValue())] ?? "N/A"}</span>
            ),
        }),
        columnHelper.accessor("price", {
            header: (info) => <SortHeader label="Giá" columnId="price" info={info}/>,
            cell: (info) => (
                <span>{new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(info.getValue())}</span>
            ),
        }),
        columnHelper.accessor("status", {
            header: (info) => <SortHeader label="Trạng thái" columnId="status" info={info}/>,
            cell: (info) => {
                const status = Number(info.getValue())
                const match = statusMap[status]
                return match ? (
                    <Badge className={match.className}>{match.label}</Badge>
                ) : (
                    <Badge>{status}</Badge>
                )
            },
        }),
        columnHelper.accessor("createdAt", {
            header: (info) => <SortHeader label="Ngày tạo" columnId="createdAt" info={info}/>,
            cell: (info) => (
                <span className="text-sm text-muted-foreground">
                    {formatDate(info.getValue() as Date)}
                </span>
            ),
        }),
    ])
}
