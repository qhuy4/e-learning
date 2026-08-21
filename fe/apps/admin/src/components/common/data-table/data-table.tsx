"use client"

import {useTable, type ColumnDef, type RowData} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {features, type DataTableFeatures} from "@/components/common/data-table/data-table-features.ts"
import {Button} from "@fe/components/ui/button.tsx";
import {Skeleton} from "@fe/components/ui/skeleton.tsx";

interface DataTableProps<TData extends RowData> {
    columns: ColumnDef<DataTableFeatures, TData>[]
    data: TData[]
    onRowClick?: (row: TData) => void
    page: number
    pageSize: number
    totalPages: number
    onPageChange: (page: number) => void
    loading?: boolean
}

export function DataTable<TData extends RowData>({
    columns, data,
    onRowClick,
    page,
    totalPages,
    onPageChange,
    pageSize,
    loading = false,
}: DataTableProps<TData>) {

    const table = useTable({
        features,
        data,
        columns,
    })
    return (

        <div className="overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="bg-muted/50 ">
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
                                            ? "cursor-pointer h-12"
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
            <div className="flex items-center justify-end gap-1 py-4 pe-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
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
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}