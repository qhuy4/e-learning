import { useState } from "react"
import { Ban } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@fe/components/ui/dialog"
import { Button } from "@fe/components/ui/button"
import { Input } from "@fe/components/ui/input"

import { type User } from "@/features/users/types/user.type"
import {useBlockUser} from "@/features/users/hook/use-user.ts";
import {toast} from "sonner";


interface BlockReasonDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: User | null
    onSuccess: () => void
}

export function BlockReasonDialog({
    open,
    onOpenChange,
    user,
    onSuccess,
}: BlockReasonDialogProps) {
    const blockUser = useBlockUser()
    const [reason, setReason] = useState("")
    const [error, setError] = useState("")

    function handleBlock() {
        if (!user) return

        if (!reason.trim()) {
            setError("Block reason is required")
            return
        }

        setError("")
        blockUser.mutate(
            { id: user.id, reason: reason.trim() },
            {
                onSuccess: () => {

                    setReason("")
                    onSuccess()
                    onOpenChange(false)
                    toast.success("User blocked", {
                        description: `${user.name} has been successfully blocked.`,
                    })
                },
                onError: (error) => {
                    console.error(error)

                    toast.error("Failed to block user")
                },
            }
        )
    }

    function handleClose() {
        setReason("")
        setError("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader className="items-center text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 mb-1">
                        <Ban className="size-6 text-destructive" />
                    </div>
                    <DialogTitle>Block User</DialogTitle>
                    <DialogDescription>
                        {user ? (
                            <>
                                You are about to block{" "}
                                <span className="font-medium text-foreground">{user.name}</span>
                                {" "}
                                <span className="text-muted-foreground">({user.email})</span>.
                            </>
                        ) : (
                            "You are about to block this user."
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="px-4 py-3 space-y-2">
                    <label className="text-sm font-medium" htmlFor="block-reason">
                        Block Reason <span className="text-destructive">*</span>
                    </label>
                    <Input
                        id="block-reason"
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value)
                            if (error) setError("")
                        }}
                        placeholder="Enter reason for blocking this user"
                    />
                    {(error || blockUser.isError) && (
                        <p className="text-xs text-destructive">
                            {error || (blockUser.error instanceof Error ? blockUser.error.message : "Failed to block user")}
                        </p>
                    )}
                </div>

                <DialogFooter className="flex flex-row gap-3 justify-center sm:justify-center">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={blockUser.isPending}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => handleBlock()}
                        disabled={blockUser.isPending}
                        className="flex-1"
                    >
                        {blockUser.isPending ? "Blocking..." : "Block User"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
