import {DataTable} from "@/components/common/data-table/data-table"
import {columns, type User} from "@/features/users/column"
import {useNavigate} from "react-router";
import {useEffect, useState} from "react";
import {userService} from "@/features/users/service.ts";
import type {PaginationResponse} from "@/shared/types/pagination.ts";

export default function UsersPage() {
    const navigate = useNavigate()

    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [result, setResult] =
        useState<PaginationResponse<User>>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)

        userService.getUsers(page, limit)
            .then(setResult).finally(() => setLoading(false))
    }, [page, limit])

    const totalPages = result
        ? Math.ceil(result.meta.total / result.meta.limit)
        : 0
    return (
        <div className="p-6">
            <h1 className="mb-4 text-2xl font-bold">
                Users
            </h1>

            <DataTable
                columns={columns}
                data={result?.data ?? []}
                page={page}
                totalPages={totalPages}
                loading={loading}
                pageSize={limit}
                onPageChange={setPage}
                onRowClick={(user) =>
                    navigate(`/users/${user.id}`)
                }
            />
        </div>
    )
}