import {DataTable} from "@/components/common/data-table/data-table.tsx";
import {Button} from "@fe/components/ui/button.tsx";
import {Plus} from "lucide-react";
import {DeleteConfirmDialog} from "@/features/users/components/delete-confirm-diialog.tsx";
import {useNavigate} from "react-router";
import type {Instructor} from "@/features/instructors/type/instructor.ts";
import {createInstructorColumns} from "@/features/instructors/column.tsx";
import {useListPage} from "@/components/common/page/use-list-page.ts";
import {useDeleteDialog} from "@/features/users/hook/user-dialog.ts";
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

    const {
        open: deleteOpen,
        item: deletingInstructor,
        setOpen: setDeleteOpen,
        handleDelete,
    } = useDeleteDialog<Instructor>()

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
                <Button onClick={handleCreate}>
                    <Plus className="size-4"/>
                    Tạo giảng viên
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
                tableMeta={{onEdit: handleEdit, onDelete: handleDelete}}
            />

            <DeleteConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                user={deletingInstructor}
                onSuccess={() => {
                    setDeleteOpen(false)
                }}
            />
        </div>
    )
}
