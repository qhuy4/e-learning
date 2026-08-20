import { DataTable } from "@/components/common/data-table/data-table"
import { columns, type User } from "@/features/users/column"
import {useNavigate} from "react-router";
import {useEffect, useState} from "react";
import {userService} from "@/features/users/service.ts";

export default function UsersPage() {
    const navigate = useNavigate()
    const [users, setUsers] = useState<User[]>([]);
    useEffect(() => {
        userService
            .getUsers()
            .then(setUsers)
    }, []);
    return (
        <div className="p-6">
            <h1 className="mb-4 text-2xl font-bold">
                Users
            </h1>
            <DataTable
                columns={columns} data={users}
                       onRowClick={(user) => navigate(`/users/${user.id}`)}
            />
        </div>
    )
}