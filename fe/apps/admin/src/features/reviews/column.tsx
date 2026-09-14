"use client"

import {createColumnHelper} from "@tanstack/react-table"
import {ArrowUp, ArrowDown, ArrowUpDown} from "lucide-react"
import type {HeaderContext} from "@tanstack/react-table"

import {type DataTableFeatures} from "@/components/common/data-table/data-table-features.ts"
import {Badge} from "@fe/components/ui/badge.tsx"
import type {Review, ReviewStatus} from "@/features/reviews/types/review.ts";
import {reviewStatusLabel, reviewStatusClassName} from "@/features/reviews/types/review.ts";

const columnHelper = createColumnHelper<DataTableFeatures, Review>()

interface TableMetaType {
    sortBy?: string
    sortOrder?: "asc" | "desc"
    onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void
    onUpdateStatus?: (review: Review, status: number) => void
}

function SortHeader<TValue>({
    label,
    columnId,
    info,
}: {
    label: string
    columnId: string
    info: HeaderContext<DataTableFeatures, Review, TValue>
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

function formatDate(date: Date | null) {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

function Stars({rating}: {rating: number}) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={star <= rating ? "text-yellow-500" : "text-gray-300"}
                >
                    ★
                </span>
            ))}
        </div>
    )
}

export function createReviewColumns() {
    return columnHelper.columns([
        columnHelper.accessor("user.name", {
            header: (info) => <SortHeader label="Học viên" columnId="userName" info={info}/>,
            cell: (info) => {
                const name = info.getValue()
                return <span className="text-sm">{name || "—"}</span>
            },
        }),
        columnHelper.accessor("course.title", {
            header: (info) => <SortHeader label="Khóa học" columnId="courseTitle" info={info}/>,
            cell: (info) => {
                const title = info.getValue()
                return <span className="text-sm">{title || "—"}</span>
            },
        }),
        columnHelper.accessor("rating", {
            header: (info) => <SortHeader label="Đánh giá" columnId="rating" info={info}/>,
            cell: (info) => {
                const rating = info.getValue()
                return <Stars rating={rating}/>
            },
        }),
        columnHelper.accessor("comment", {
            header: (info) => <SortHeader label="Nội dung" columnId="comment" info={info}/>,
            cell: (info) => {
                const comment = info.getValue()
                return (
                    <div className="max-w-xs truncate text-sm">
                        {comment || <span className="text-muted-foreground">—</span>}
                    </div>
                )
            },
        }),
        columnHelper.accessor("status", {
            header: (info) => <SortHeader label="Trạng thái" columnId="status" info={info}/>,
            cell: (info) => {
                const status = info.getValue() as ReviewStatus
                return (
                    <Badge className={reviewStatusClassName[status]}>
                        {reviewStatusLabel[status]}
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
                        {formatDate(createdAt as Date)}
                    </span>
                )
            },
        }),
    ])
}
