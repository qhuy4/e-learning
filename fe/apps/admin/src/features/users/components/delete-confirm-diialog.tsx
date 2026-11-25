import { AlertTriangle } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@fe/components/ui/dialog"
import { Button } from "@fe/components/ui/button"

import { type User } from "@/features/users/types/user.type"
import {useDeleteUser} from "@/features/users/hook/use-user.ts";

interface DeleteConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: Pick<User, "id" | "name" | "email"> | null
    onSuccess: () => void
}

export function DeleteConfirmDialog({
    open,
    onOpenChange,
    user,
    onSuccess,
}: DeleteConfirmDialogProps) {
    const deleteUser = useDeleteUser()

    function handleDelete() {
        if (!user) return

        deleteUser.mutate(user.id, {
            onSuccess: () => {
                onSuccess()
                onOpenChange(false)
            },
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader className="items-center text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 mb-1">
                        <AlertTriangle className="size-6 text-destructive" />
                    </div>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        {user ? (
                            <>
                                You are about to delete{" "}
                                <span className="font-medium text-foreground">{user.name}</span>
                                {" "}
                                <span className="text-muted-foreground">({user.email})</span>.
                            </>
                        ) : (
                            "You are about to delete this user."
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="px-4 py-3 my-2 rounded-md border border-destructive/20 bg-destructive/5 text-sm text-destructive text-center">
                    This action will permanently remove the user. This cannot be undone.
                </div>

                {deleteUser.isError && (
                    <p className="text-sm text-destructive text-center px-4">
                        {deleteUser.error instanceof Error ? deleteUser.error.message : "Failed to delete user"}
                    </p>
                )}

                <DialogFooter className="flex flex-row gap-3 justify-center sm:justify-center">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deleteUser.isPending}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => handleDelete()}
                        disabled={deleteUser.isPending}
                        className="flex-1"
                    >
                        {deleteUser.isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
