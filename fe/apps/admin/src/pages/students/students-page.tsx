import {DataTable} from "@/components/common/data-table/data-table";
import {createUserColumns} from "@/features/users/column";
import {useNavigate} from "react-router";
import {Plus} from "lucide-react";
import type {User} from "@/features/users/types/user.type";
import {Button} from "@fe/components/ui/button";
import {useUsers} from "@/features/users/hook/use-user.ts";
import {DeleteConfirmDialog} from "@/features/users/components/delete-confirm-diialog.tsx";
import {useListPage} from "@/components/common/page/use-list-page.ts";
import {useDeleteDialog} from "@/features/users/hook/user-dialog.ts";

const STUDENT_ROLE = "STUDENT";

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

    const {
        open: deleteOpen,
        item: deletingUser,
        setOpen: setDeleteOpen,
        handleDelete,
    } = useDeleteDialog<User>()

    const {data: result, isLoading: loading, refetch, isFetching} = useUsers(
        page,
        limit,
        debouncedSearch || undefined,
        sortBy,
        sortOrder,
        STUDENT_ROLE
    )

    const totalPages = result
        ? Math.ceil(result.meta.total / result.meta.limit)
        : 0

    const handleCreate = () => {
        navigate("/students/create")
    }

    const handleEdit = (user: User) => {
        navigate(`/students/${user.id}/edit`)
    }

    const columns = createUserColumns(() => [
        {
            label: "Sửa",
            onClick: handleEdit,
        },
        {
            label: "Xóa",
            variant: "destructive",
            onClick: handleDelete,
        },
    ])

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Học viên</h1>
                <Button onClick={handleCreate}>
                    <Plus className="size-4"/>
                    Tạo học viên
                </Button>
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
                onRowClick={(user) => navigate(`/students/${user.id}`)}
                search={search}
                onSearchChange={setSearch}
                onPageSizeChange={(newLimit) => {
                    setLimit(newLimit)
                    setPage(1)
                }}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                tableMeta={{onEdit: handleEdit, onDelete: handleDelete}}
                text={{
                    searchPlaceholder: "Tìm kiếm học viên...",
                    reload: "Tải lại",
                    rowsPerPage: "Dòng trên trang",
                    noResults: "Không có kết quả.",
                    pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
                    previous: "Trước",
                    next: "Sau",
                }}
            />

            <DeleteConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                user={deletingUser}
                onSuccess={() => {
                    setDeleteOpen(false)
                }}
            />
        </div>
    )
}
