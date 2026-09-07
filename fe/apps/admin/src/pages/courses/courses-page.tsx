import {useNavigate} from "react-router-dom";
import {DataTable} from "@/components/common/data-table/data-table";
import {useListPage} from "@/components/common/page/use-list-page";
import {useAdminCourses} from "@/features/admin-courses/hooks/use-admin-course";
import {createCourseColumns} from "@/features/admin-courses/components/course-columns";

export default function CourseListPage() {
    const navigate = useNavigate();
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
    } = useListPage();

    const {data, isLoading, refetch, isFetching} = useAdminCourses(
        page,
        limit,
        debouncedSearch || undefined,
        sortBy,
        sortOrder,
    );

    const courses = data?.data ?? [];
    const meta = data?.meta;
    const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;
    const columns = createCourseColumns();

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý khóa học</h1>
                    <p className="text-sm text-muted-foreground mt-1">Danh sách tất cả khóa học trên nền tảng</p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={courses}
                page={page}
                totalPages={totalPages}
                loading={isLoading}
                isFetching={isFetching}
                refetch={refetch}
                pageSize={limit}
                onPageChange={setPage}
                onRowClick={(row) => navigate(`/courses/${row.id}`)}
                search={search}
                onSearchChange={setSearch}
                onPageSizeChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                }}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                text={{
                    searchPlaceholder: "Tìm kiếm tên khóa học...",
                    reload: "Tải lại",
                    rowsPerPage: "Dòng trên trang",
                    noResults: "Không có kết quả.",
                    pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
                    previous: "Trước",
                    next: "Sau",
                }}
            />
        </div>
    );
}
