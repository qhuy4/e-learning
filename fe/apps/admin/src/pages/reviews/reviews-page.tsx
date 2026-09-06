import {DataTable} from "@/components/common/data-table/data-table";
import {createReviewColumns} from "@/features/reviews/column";
import type {Review} from "@/features/reviews/types/review";
import {useReviews, useUpdateReviewStatus} from "@/features/reviews/hook/use-review.ts";
import {useListPage} from "@/components/common/page/use-list-page.ts";
import {toast} from "sonner";

export default function ReviewsPage() {
    const {
        page,
        limit,
        search,
        debouncedSearch,
        sortBy,
        sortOrder,
        setPage,
        setLimit,
        setSearch,
        handleSortChange,
    } = useListPage()

    const {data: result, isLoading: loading, refetch, isFetching} = useReviews(
        page,
        limit,
        debouncedSearch || undefined,
        sortBy,
        sortOrder
    )

    const updateStatusMutation = useUpdateReviewStatus()

    const totalPages = result
        ? Math.ceil(result.meta.total / result.meta.limit)
        : 0

    const handleUpdateStatus = (review: Review, status: number) => {
        updateStatusMutation.mutate(
            {id: review.id, status},
            {
                onSuccess: () => {
                    toast.success("Cập nhật trạng thái thành công")
                },
                onError: () => {
                    toast.error("Có lỗi xảy ra")
                },
            }
        )
    }

    const columns = createReviewColumns()

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Đánh giá</h1>
            </div>

            <DataTable
                columns={columns}
                data={result?.data ?? []}
                page={page}
                totalPages={totalPages}
                loading={loading}
                isFetching={isFetching}
                refetch={refetch}
                pageSize={limit}
                onPageChange={setPage}
                search={search}
                onSearchChange={setSearch}
                onPageSizeChange={(newLimit) => {
                    setLimit(newLimit)
                    setPage(1)
                }}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                tableMeta={{onUpdateStatus: handleUpdateStatus}}
                text={{
                    searchPlaceholder: "Tìm kiếm...",
                    reload: "Tải lại",
                    rowsPerPage: "Dòng trên trang",
                    noResults: "Không có kết quả.",
                    pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
                    previous: "Trước",
                    next: "Sau",
                }}
            />
        </div>
    )
}
