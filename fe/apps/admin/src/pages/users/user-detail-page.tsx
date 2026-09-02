import {useState} from "react"
import {useParams, useNavigate} from "react-router"
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Globe,
    User as UserIcon,
    Pencil,
    Trash2, CheckCircle, Ban,
} from "lucide-react"

import {Button} from "@fe/components/ui/button"
import {Badge} from "@fe/components/ui/badge"
import {Avatar, AvatarFallback, AvatarImage} from "@fe/components/ui/avatar"
import {Separator} from "@fe/components/ui/separator"
import {Skeleton} from "@fe/components/ui/skeleton"
import {genderLabel, UserRole, UserStatus} from "@/features/users/constants/users.constants.ts";
import {useUnblockUser, useUser} from "@/features/users/hook/use-user.ts";
import {formatDate, getAvatarUrl, initials} from "@/features/users/utils/ultis.ts";
import {toast} from "sonner";
import {BlockReasonDialog} from "@/features/users/components/block-reason-dialog.tsx";
import {DeleteConfirmDialog} from "@/features/users/components/delete-confirm-diialog.tsx";
import {PageSkeleton} from "@/features/users/components/skeleton.tsx";

function statusVariant(status: UserStatus) {
    if (status === UserStatus.ACTIVE) return "default" as const
    if (status === UserStatus.BLOCKED) return "destructive" as const
    if (status === UserStatus.PENDING) return "secondary" as const
    return "outline" as const
}

function DetailRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: React.ReactNode
}) {
    return (
        <div className="flex items-start gap-3">
            <div
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium break-all">{value ?? "—"}</p>
            </div>
        </div>
    )
}



export function UserDetailPage() {
    const {id} = useParams<{ id: string }>()
    const navigate = useNavigate()
    const userId = Number(id)

    const {data: user, isLoading, isError} = useUser(userId)

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [blockOpen, setBlockOpen] = useState(false)
    const unblockUser = useUnblockUser()

    function handleUnblock() {
        if (!user) return
        unblockUser.mutate(user.id, {
            onSuccess: () => {
                toast.success("User unblocked", {
                    description: `${user.name} has been successfully unblocked.`,
                })
            },
        })
    }

    if (isLoading) return <PageSkeleton/>


    if (isError || !user) {
        return (
            <div className="p-6 mx-auto">
                <Button variant="ghost" size="sm" onClick={() => navigate("/users")} className="mb-6 -ml-2">
                    <ArrowLeft className="size-4"/>
                    Back to Users
                </Button>
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <UserIcon className="size-12 text-muted-foreground mb-4"/>
                    <h2 className="text-lg font-semibold">User not found</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        The user you are looking for does not exist or has been removed.
                    </p>
                    <Button className="mt-6" onClick={() => navigate("/users")}>
                        Back to Users
                    </Button>
                </div>
            </div>
        )
    }

    const p = user?.profile
    const isBlocked = user.status === UserStatus.BLOCKED

    return (
        <div className="p-6 mx-auto space-y-6">
            {/* Back */}
            <Button variant="ghost" size="sm" onClick={() => navigate("/users")} className="-ml-2">
                <ArrowLeft className="size-4"/>
                Back to Users
            </Button>
<div className="flex gap-5 justify-between">
    <div className="rounded-xl border bg-card p-6 space-y-4 grow-1">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar size="lg" className="size-16 text-lg">
                    {p?.avatarUrl ? (
                        <AvatarImage
                            src={getAvatarUrl(p.avatarUrl)}
                            alt={user.name}
                        />
                    ) : null}

                    <AvatarFallback>
                        {initials(user)}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1.5">
                    <h1 className="text-xl font-bold leading-tight">{user.name}</h1>
                    {p && p?.occupation && (
                        <p className="text-sm text-muted-foreground">{p?.occupation}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={user.role === UserRole.ADMIN ? "default" : "outline"}>
                            {user.role}
                        </Badge>
                        <Badge variant={statusVariant(user.status)}>
                            {user.status}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                >
                    <Pencil className="size-3.5"/>
                    Edit
                </Button>
                {isBlocked ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUnblock}
                        disabled={unblockUser.isPending}
                    >
                        <CheckCircle className="size-3.5"/>
                        {unblockUser.isPending ? "Unblocking..." : "Unblock"}
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBlockOpen(true)}
                    >
                        <Ban className="size-3.5"/>
                        Block
                    </Button>
                )}
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteOpen(true)}
                >
                    <Trash2 className="size-3.5"/>
                    Delete
                </Button>
            </div>
        </div>

        {/* Bio */}
        {p && p?.bio && (
            <>
                <Separator/>
                <p className="text-sm text-muted-foreground leading-relaxed">{p?.bio}</p>
            </>
        )}
    </div>

    {/* Account Details */}
    <div className="rounded-xl border bg-card p-6 space-y-4 grow-1">
        <h2 className="text-sm font-semibold">Account Details</h2>
        <Separator/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailRow
                icon={<Calendar className="size-3.5"/>}
                label="Created"
                value={formatDate(user.createdAt)}
            />
            <DetailRow
                icon={<Calendar className="size-3.5"/>}
                label="Last Updated"
                value={formatDate(user.updatedAt)}
            />
            {user.status === UserStatus.BLOCKED && (
                <>
                    <DetailRow
                        icon={<Calendar className="size-3.5"/>}
                        label="Blocked At"
                        value={formatDate(user.blockedAt)}
                    />
                    <DetailRow
                        icon={<UserIcon className="size-3.5"/>}
                        label="Block Reason"
                        value={user.blockReason}
                    />
                </>
            )}
        </div>
    </div>
</div>
            {/* Profile Details */}
            <div className="rounded-xl border bg-card p-6 space-y-4 grow-1">
                <h2 className="text-sm font-semibold">Profile Details</h2>
                <Separator/>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailRow
                        icon={<Mail className="size-3.5"/>}
                        label="Email"
                        value={user.email}
                    />
                    <DetailRow
                        icon={<Phone className="size-3.5"/>}
                        label="Phone"
                        value={p && p.phone}
                    />
                    <DetailRow
                        icon={<UserIcon className="size-3.5"/>}
                        label="Gender"
                        value={p && p.gender != null ? genderLabel[p.gender] : null}
                    />
                    <DetailRow
                        icon={<Calendar className="size-3.5"/>}
                        label="Date of Birth"
                        value={formatDate(p && p.dateOfBirth)}
                    />
                    <DetailRow
                        icon={<Briefcase className="size-3.5"/>}
                        label="Occupation"
                        value={p && p.occupation}
                    />
                    <DetailRow
                        icon={<MapPin className="size-3.5"/>}
                        label="Address"
                        value={
                            p && [p.address, p.city, p.country].filter(Boolean).join(", ") || null
                        }
                    />
                    <DetailRow
                        icon={<Globe className="size-3.5"/>}
                        label="Country"
                        value={p && p.country}
                    />
                </div>
            </div>

            <BlockReasonDialog
                open={blockOpen}
                onOpenChange={setBlockOpen}
                user={user}
                onSuccess={() => {
                }}
            />
            {/* Delete Sheet */}
            <DeleteConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                user={user}
                onSuccess={() => navigate("/users")}
            />
        </div>
    )
}
