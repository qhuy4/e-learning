import type {RowAction} from "@/shared/types/row-action.ts";
import type {ColumnDef, RowData} from "@tanstack/react-table";
import type {DataTableFeatures} from "@/components/common/data-table/data-table-features.ts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@fe/components/ui/dropdown-menu.tsx";
import {Button} from "@fe/components/ui/button.tsx";
import {MoreHorizontal} from "lucide-react";

export function createActionsColumn<T extends RowData>(
    getActions: (item: T) => RowAction<T>[]
): ColumnDef<DataTableFeatures, T> {
    return {
        id: "actions",

        header: () => (
            <span className="sr-only">
                Actions
            </span>
        ),

        cell: ({row}) => {
            const item = row.original

            const actions = getActions(item)
                .filter((action) => !action.hidden?.(item))

            return (
                <div
                    className="flex justify-end"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="Open actions"
                                />
                            }
                        >
                            <MoreHorizontal className="size-4"/>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            {actions.map((action) => (
                                <DropdownMenuItem
                                    key={action.label}
                                    variant={action.variant}
                                    onClick={() =>
                                        action.onClick(item)
                                    }
                                >
                                    {action.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    }
}
