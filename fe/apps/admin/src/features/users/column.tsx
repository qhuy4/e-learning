"use client"

import {createColumnHelper} from "@tanstack/react-table"
import {ArrowUp, ArrowDown, ArrowUpDown, MoreHorizontal} from "lucide-react"
import type {HeaderContext} from "@tanstack/react-table"

import {type DataTableFeatures} from "@/components/common/data-table/data-table-features.ts"
import {Badge} from "@fe/components/ui/badge.tsx"
import {Button} from "@fe/components/ui/button.tsx"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@fe/components/ui/dropdown-menu.tsx"
import {
    roleClassName,
    statusClassName,
    userRoleLabel,
    userStatusLabel
} from "@/features/users/constants/users.constants.ts";
import type {User} from "@/features/users/types/user.type.ts";
import {Avatar, AvatarFallback, AvatarImage} from "@fe/components/ui/avatar.tsx";

const columnHelper = createColumnHelper<DataTableFeatures, User>()

interface TableMetaType {
    sortBy?: string
    sortOrder?: "asc" | "desc"
    onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void
    onEdit?: (user: User) => void
    onDelete?: (user: User) => void
}

function initials(user: User) {
    const fromProfile = `${user.profile?.firstName?.[0] ?? ""}${user.profile?.lastName?.[0] ?? ""}`
    if (fromProfile.trim()) return fromProfile.toUpperCase()
    return user.name.slice(0, 2).toUpperCase()
}

function SortHeader<TValue>({
    label,
    columnId,
    info,
}: {
    label: string
    columnId: string
    info: HeaderContext<DataTableFeatures, User, TValue>
}) {
    const meta = info.table.options.meta as TableMetaType | undefined
    const isSorted = meta?.sortBy === columnId
    const sortOrder = isSorted ? meta?.sortOrder : null

    return (
        <button
            type="button"
            className="flex items-center gap-1 cursor-pointer select-none hover:text-foreground font-medium text-left bg-transparent border-none p-0 outline-none"
            onClick={(e) => {
                e.stopPropagation()
                const nextOrder = sortOrder === "asc" ? "desc" : "asc"
                meta?.onSortChange?.(columnId, nextOrder)
            }}
        >
            <span>{label}</span>
            {sortOrder === "asc" ? (
                <ArrowUp className="h-3.5 w-3.5 ml-1"/>
            ) : sortOrder === "desc" ? (
                <ArrowDown className="h-3.5 w-3.5 ml-1"/>
            ) : (
                <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-muted-foreground/30"/>
            )}
        </button>
    )
}

export function createUserColumns() {
    return columnHelper.columns([
        columnHelper.accessor("name", {
            header: (info) => <SortHeader label="User" columnId="name" info={info}/>,
            cell: (info) => {
                const user = info.row.original
                return (
                    <div className="flex items-center gap-3 min-w-40">
                        <Avatar size="sm">
                            {user.profile?.avatarUrl ? (
                                <AvatarImage src={user.profile.avatarUrl} alt=""/>
                            ) : null}
                            <AvatarFallback>{initials(user)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div className="truncate font-medium">{user.name}</div>
                            <div className="truncate text-xs text-muted-foreground">
                                {user.profile?.occupation ?? "—"}
                            </div>
                        </div>
                    </div>
                )
            },
        }),
        columnHelper.accessor("email", {
            header: (info) => <SortHeader label="Email" columnId="email" info={info}/>,
        }),
        columnHelper.accessor("role", {
            header: (info) => <SortHeader label="Role" columnId="role" info={info}/>,
            cell: (info) => {
                const role = info.getValue();

                return (
                    <Badge className={roleClassName[role]}>
                        {userRoleLabel[role]}
                    </Badge>
                );
            },
        }),
        columnHelper.accessor("status", {
            header: (info) => <SortHeader label="Status" columnId="status" info={info}/>,
            cell: (info) => {
                const status = info.getValue();

                return (
                    <Badge className={statusClassName[status]}>
                        {userStatusLabel[status]}
                    </Badge>
                );
            },
        }),
        columnHelper.accessor("createdAt", {
            header: (info) => (
                <SortHeader label="Created" columnId="createdAt" info={info}/>
            ),
            cell: (info) => {
                const value = info.getValue();

                return new Date(value).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                });
            },
        }),
        columnHelper.display({
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: (info) => {
                const user = info.row.original
                const meta = info.table.options.meta as TableMetaType | undefined
                return (
                    <div
                        className="flex justify-end"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" size="icon-sm" aria-label="Open actions"/>
                                }
                            >
                                <MoreHorizontal className="size-4"/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => meta?.onEdit?.(user)}>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => meta?.onDelete?.(user)}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        }),
    ])
}
