import {DataTable} from "@/components/common/data-table/data-table.tsx";
import {Button} from "@fe/components/ui/button.tsx";
import {Plus} from "lucide-react";
import {useNavigate} from "react-router";
import type {Instructor} from "@/features/instructors/type/instructor.ts";
import {createInstructorColumns} from "@/features/instructors/column.tsx";
import {useListPage} from "@/components/common/page/use-list-page.ts";
import {useInstructors} from "@/features/instructors/hook/use-instructors.ts";

const columns = createInstructorColumns()

export default function InstructorsPage() {
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

    const navigate = useNavigate()

    const {data: result, isLoading: loading, refetch, isFetching} = useInstructors(
        page,
        limit,
        debouncedSearch || undefined,
        sortBy,
        sortOrder
    )

    const totalPages = result
        ? Math.ceil(result.meta.total / result.meta.limit)
        : 0

    const handleCreate = () => {
        navigate("/instructors/create")
    }

    const handleEdit = (instructor: Instructor) => {
        navigate(`/instructors/${instructor.id}/edit`)
    }

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Giảng viên</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate("/instructors/applications")}>
                        Đơn đăng ký
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="size-4"/>
                        Tạo giảng viên
                    </Button>
                </div>
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
                onRowClick={(instructor) => navigate(`/instructors/${instructor.id}`)}
                search={search}
                onSearchChange={setSearch}
                onPageSizeChange={(newLimit) => {
                    setLimit(newLimit)
                    setPage(1)
                }}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                tableMeta={{onEdit: handleEdit}}
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
