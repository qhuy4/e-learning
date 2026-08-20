"use client"

import { createColumnHelper } from "@tanstack/react-table"

import { type DataTableFeatures } from "@/components/common/data-table/data-table-features.ts"


export type User = {
    id: number
    email: string
    name: string
}

const columnHelper = createColumnHelper<DataTableFeatures, User>()

export const columns = columnHelper.columns([
    columnHelper.accessor("id", {
        header: "ID",
    }),
    columnHelper.accessor("email", {
        header: "Email",
    }),
    columnHelper.accessor("name", {
        header: "Name",
    }),


])