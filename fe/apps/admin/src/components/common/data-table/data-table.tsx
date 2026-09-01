"use client"

import {useTable, type ColumnDef, type RowData} from "@tanstack/react-table"
import { Search } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {features, type DataTableFeatures} from "@/components/common/data-table/data-table-features.ts"
import {Button} from '@fe/components/ui/button.tsx';
import {Skeleton} from "@fe/components/ui/skeleton.tsx";
import {Input} from "@fe/components/ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@fe/components/ui/select.tsx";

interface DataTableProps<TData extends RowData> {
    columns: ColumnDef<DataTableFeatures, TData>[]
    data: TData[]
    onRowClick?: (row: TData) => void
    page: number
    pageSize: number
    totalPages: number
    onPageChange: (page: number) => void
    loading?: boolean

    // Search and filtering
    search?: string
    onSearchChange?: (search: string) => void

    // Limit/Page size changer
    onPageSizeChange?: (pageSize: number) => void

    // Sorting
    sortBy?: string
    sortOrder?: "asc" | "desc"
    onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void

    // Additional meta to forward to the table instance (e.g. onEdit, onDelete)
    tableMeta?: Record<string, unknown>
}

export function DataTable<TData extends RowData>({
    columns,
    data,
    onRowClick,
    page,
    totalPages,
    onPageChange,
    pageSize,
    loading = false,
    search,
    onSearchChange,
    onPageSizeChange,
    sortBy,
    sortOrder,
    onSortChange,
    tableMeta,
}: DataTableProps<TData>) {

    const table = useTable({
        features,
        data,
        columns,
        meta: {
            sortBy,
            sortOrder,
            onSortChange,
            ...tableMeta,
        },
    })

    return (
        <div className="space-y-4">
            {/* Top Toolbar */}
            {(onSearchChange || onPageSizeChange) && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {onSearchChange && (
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={search || ""}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                    )}

                    {onPageSizeChange && (
                        <div className="flex items-center gap-2 sm:ml-auto">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                Rows per page
                            </span>
                            <Select
                                value={String(pageSize)}
                                onValueChange={(val) => onPageSizeChange(Number(val))}
                            >
                                <SelectTrigger className="h-9 w-[80px]">
                                    <SelectValue placeholder={String(pageSize)} />
                                </SelectTrigger>
                                <SelectContent>
                                    {[5, 10, 20, 50].map((size) => (
                                        <SelectItem key={size} value={String(size)}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            )}

            {/* Table Container */}
            <div className="w-full overflow-hidden rounded-md border bg-card">
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-muted/50">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : (
                                                    <table.FlexRender header={header}/>
                                                )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({length: pageSize}).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`} className="h-12">
                                        {columns.map((_, columnIndex) => (
                                            <TableCell key={columnIndex}>
                                                <Skeleton className="h-5 w-full"/>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows?.length ? (
                                <>
                                    {table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className={
                                                onRowClick
                                                    ? "cursor-pointer h-12 hover:bg-muted/50 transition-colors"
                                                    : "h-12"
                                            }
                                            onClick={() => onRowClick?.(row.original)}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    <table.FlexRender cell={cell}/>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}

                                    {Array.from({
                                        length: Math.max(0,
                                            pageSize - table.getRowModel().rows.length
                                        ),
                                    }).map((_, index) => (
                                        <TableRow key={`empty-${index}`} className="h-12">
                                            {columns.map((_, columnIndex) => (
                                                <TableCell key={columnIndex}/>
                                            ))}
                                        </TableRow>
                                    ))}
                                </>
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    Page {page} of {totalPages || 1}
                </div>
                <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1 || loading}
                        onClick={() => onPageChange(page - 1)}
                    >
                        Previous
                    </Button>

                    {Array.from({length: totalPages}, (_, index) => {
                        const pageNumber = index + 1

                        return (
                            <Button
                                disabled={loading}
                                key={pageNumber}
                                variant={pageNumber === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => onPageChange(pageNumber)}
                            >
                                {pageNumber}
                            </Button>
                        )
                    })}

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages || totalPages === 0 || loading}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}