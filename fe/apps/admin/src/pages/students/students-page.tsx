import {DataTable} from "@/components/common/data-table/data-table";
import {createStudentColumns} from "@/features/students/column";
import {useNavigate} from "react-router";
import type {Student} from "@/features/students/types/student";
import {useStudents} from "@/features/students/hook/use-student.ts";
import {useListPage} from "@/components/common/page/use-list-page.ts";

export default function StudentsPage() {
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

    const {data: result, isLoading: loading, refetch, isFetching} = useStudents(
        page,
        limit,
        debouncedSearch || undefined,
        sortBy,
        sortOrder
    )

    const totalPages = result
        ? Math.ceil(result.meta.total / result.meta.limit)
        : 0

    const handleView = (student: Student) => {
        navigate(`/users/${student.id}`)
    }

    const columns = createStudentColumns()

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Học viên</h1>
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
                onRowClick={(student) => navigate(`/users/${student.id}`)}
                search={search}
                onSearchChange={setSearch}
                onPageSizeChange={(newLimit) => {
                    setLimit(newLimit)
                    setPage(1)
                }}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                tableMeta={{onEdit: handleView}}
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
