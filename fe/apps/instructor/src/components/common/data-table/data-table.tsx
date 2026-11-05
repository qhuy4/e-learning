import {useTable, type ColumnDef, type RowData} from "@tanstack/react-table"
import { RefreshCw, Search } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {features, type DataTableFeatures, type DataTableMeta} from "@/components/common/data-table/data-table-features"
import {Button} from '@fe/components/ui/button';
import {Skeleton} from "@fe/components/ui/skeleton";
import {Input} from "@fe/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@fe/components/ui/select";

interface DataTableText {
    searchPlaceholder?: string
    reload?: string
    rowsPerPage?: string
    noResults?: string
    pageOf?: (page: number, totalPages: number) => string
    previous?: string
    next?: string
}

interface DataTableProps<TData extends RowData> {
    columns: ColumnDef<DataTableFeatures, TData, any>[]
    data: TData[]
    onRowClick?: (row: TData) => void
    page: number
    pageSize: number
    totalPages: number
    onPageChange: (page: number) => void
    loading?: boolean

    refetch?: () => void
    isFetching?: boolean

    search?: string
    onSearchChange?: (search: string) => void

    onPageSizeChange?: (pageSize: number) => void

    sortBy?: string
    sortOrder?: "asc" | "desc"
    onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void

    tableMeta?: Partial<DataTableMeta>

    text?: DataTableText
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
    refetch,
    isFetching = false,
    search,
    onSearchChange,
    onPageSizeChange,
    sortBy,
    sortOrder,
    onSortChange,
    tableMeta,
    text,
}: DataTableProps<TData>) {

    const t = {
        searchPlaceholder: text?.searchPlaceholder ?? "Tìm kiếm...",
        reload: text?.reload ?? "Tải lại",
        rowsPerPage: text?.rowsPerPage ?? "Hàng mỗi trang",
        noResults: text?.noResults ?? "Không có kết quả.",
        pageOf: text?.pageOf ?? ((p, tp) => `Trang ${p} của ${tp || 1}`),
        previous: text?.previous ?? "Trước",
        next: text?.next ?? "Tiếp",
    }

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

    const isLoading = loading || isFetching

    return (
        <div className="space-y-4">
            {(onSearchChange || onPageSizeChange || refetch) && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {onSearchChange && (
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={t.searchPlaceholder}
                                value={search || ""}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2 sm:ml-auto">
                        {refetch && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                disabled={isFetching}
                            >
                                <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`}/>
                                {t.reload}
                            </Button>
                        )}
                        {onPageSizeChange && (
                            <>
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    {t.rowsPerPage}
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
                            </>
                        )}
                    </div>
                </div>
            )}

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
                            {isLoading ? (
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
                                        {t.noResults}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    {t.pageOf(page, totalPages)}
                </div>
                <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1 || isLoading}
                        onClick={() => onPageChange(page - 1)}
                    >
                        {t.previous}
                    </Button>

                    {Array.from({length: totalPages}, (_, index) => {
                        const pageNumber = index + 1

                        return (
                            <Button
                                disabled={isLoading}
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
                        disabled={page === totalPages || totalPages === 0 || isLoading}
                        onClick={() => onPageChange(page + 1)}
                    >
                        {t.next}
                    </Button>
                </div>
            </div>
        </div>
    )
}
