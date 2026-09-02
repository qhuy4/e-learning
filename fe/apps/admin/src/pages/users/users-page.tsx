import {DataTable} from "@/components/common/data-table/data-table";
import { createUserColumns } from "@/features/users/column";
// import type {User} from "@/features/users/service"
import {useNavigate} from "react-router";
import {useEffect, useState} from "react";
import { Plus } from "lucide-react";
import type { User } from "@/features/users/types/user.type";
import { Button } from "@fe/components/ui/button";
import {useUsers} from "@/features/users/hook/use-user.ts";
import {DeleteConfirmDialog} from "@/features/users/components/delete-confirm-diialog.tsx";

const columns = createUserColumns()

export default function UsersPage() {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [sortBy, setSortBy] = useState("id")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deletingUser, setDeletingUser] = useState<User | null>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    const { data: result, isLoading: loading } = useUsers(
        page,
        limit,
        debouncedSearch || undefined,
        sortBy,
        sortOrder
    )

    const totalPages = result
        ? Math.ceil(result.meta.total / result.meta.limit)
        : 0

    const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
        setSortBy(newSortBy)
        setSortOrder(newSortOrder)
        setPage(1)
    }

    const handleCreate = () => {
        navigate("/users/create")
    }

    const handleEdit = (user: User) => {
        navigate(`/users/${user.id}/edit`)
    }

    const handleDelete = (user: User) => {
        setDeletingUser(user)
        setDeleteOpen(true)
    }

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Users</h1>
                <Button onClick={handleCreate}>
                    <Plus className="size-4" />
                    Create User
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={result?.data ?? []}
                page={page}
                totalPages={totalPages}
                loading={loading}
                pageSize={limit}
                onPageChange={setPage}
                onRowClick={(user) => navigate(`/users/${user.id}`)}
                search={search}
                onSearchChange={setSearch}
                onPageSizeChange={(newLimit) => {
                    setLimit(newLimit)
                    setPage(1)
                }}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                tableMeta={{ onEdit: handleEdit, onDelete: handleDelete }}
            />

            <DeleteConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                user={deletingUser}
                onSuccess={() => {}}
            />
        </div>
    )
}
