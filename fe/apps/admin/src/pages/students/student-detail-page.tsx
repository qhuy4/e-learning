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
    Trash2,
    CheckCircle,
    Ban,
    RefreshCw,
} from "lucide-react"

import {Button} from "@fe/components/ui/button"
import {Badge} from "@fe/components/ui/badge"
import {Avatar, AvatarFallback, AvatarImage} from "@fe/components/ui/avatar"
import {Separator} from "@fe/components/ui/separator"
import {genderLabel, UserStatus} from "@/features/users/constants/users.constants.ts";
import {useUnblockUser, useUser} from "@/features/users/hook/use-user.ts";
import {formatDate, getAvatarUrl, initials} from "@/features/users/utils/ultis.ts";
import {toast} from "sonner";
import {BlockReasonDialog} from "@/features/users/components/block-reason-dialog.tsx";
import {DeleteConfirmDialog} from "@/features/users/components/delete-confirm-diialog.tsx";
import {PageSkeleton} from "@/features/users/components/skeleton.tsx";
import {ReloadingOverlay} from "@/components/common/page/reloading-overlay.tsx";

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


export function StudentDetailPage() {
    const {id} = useParams<{ id: string }>()
    const navigate = useNavigate()
    const userId = Number(id)

    const {data: user, isLoading, isError, refetch, isFetching} = useUser(userId)

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [blockOpen, setBlockOpen] = useState(false)
    const unblockUser = useUnblockUser()

    function handleUnblock() {
        if (!user) return
        unblockUser.mutate(user.id, {
            onSuccess: () => {
                toast.success("Đã bỏ chặn học viên", {
                    description: `${user.name} đã được bỏ chặn thành công.`,
                })
            },
        })
    }

    if (isLoading) return <PageSkeleton withAvatar/>

    if (isError || !user) {
        return (
            <div className="p-6 mx-auto">
                <Button variant="ghost" size="sm" onClick={() => navigate("/students")} className="mb-6 -ml-2">
                    <ArrowLeft className="size-4"/>
                    Quay lại danh sách
                </Button>
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <UserIcon className="size-12 text-muted-foreground mb-4"/>
                    <h2 className="text-lg font-semibold">Không tìm thấy học viên</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Học viên bạn tìm kiếm không tồn tại hoặc đã bị xóa.
                    </p>
                    <Button className="mt-6" onClick={() => navigate("/students")}>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        )
    }

    const p = user?.profile
    const isBlocked = user.status === UserStatus.BLOCKED

    return (
        <div className="p-6 mx-auto space-y-6 relative">
            <ReloadingOverlay isFetching={isFetching}/>

            {/* Back */}
            <Button variant="ghost" size="sm" onClick={() => navigate("/students")} className="-ml-2">
                <ArrowLeft className="size-4"/>
                Quay lại danh sách
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
                                    <Badge variant="outline">Học viên</Badge>
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
                                onClick={() => refetch()}
                                disabled={isFetching}
                            >
                                <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}/>
                                Làm mới
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/students/${user.id}/edit`)}
                            >
                                <Pencil className="size-3.5"/>
                                Chỉnh sửa
                            </Button>
                            {isBlocked ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUnblock}
                                    disabled={unblockUser.isPending}
                                >
                                    <CheckCircle className="size-3.5"/>
                                    {unblockUser.isPending ? "Đang bỏ chặn..." : "Bỏ chặn"}
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setBlockOpen(true)}
                                >
                                    <Ban className="size-3.5"/>
                                    Chặn
                                </Button>
                            )}
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteOpen(true)}
                            >
                                <Trash2 className="size-3.5"/>
                                Xóa
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
                    <h2 className="text-sm font-semibold">Thông tin tài khoản</h2>
                    <Separator/>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailRow
                            icon={<Calendar className="size-3.5"/>}
                            label="Ngày tạo"
                            value={formatDate(user.createdAt)}
                        />
                        <DetailRow
                            icon={<Calendar className="size-3.5"/>}
                            label="Cập nhật lần cuối"
                            value={formatDate(user.updatedAt)}
                        />
                        {user.status === UserStatus.BLOCKED && (
                            <>
                                <DetailRow
                                    icon={<Calendar className="size-3.5"/>}
                                    label="Ngày chặn"
                                    value={formatDate(user.blockedAt)}
                                />
                                <DetailRow
                                    icon={<UserIcon className="size-3.5"/>}
                                    label="Lý do chặn"
                                    value={user.blockReason}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* Profile Details */}
            <div className="rounded-xl border bg-card p-6 space-y-4 grow-1">
                <h2 className="text-sm font-semibold">Thông tin hồ sơ</h2>
                <Separator/>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailRow
                        icon={<Mail className="size-3.5"/>}
                        label="Email"
                        value={user.email}
                    />
                    <DetailRow
                        icon={<Phone className="size-3.5"/>}
                        label="Số điện thoại"
                        value={p && p.phone}
                    />
                    <DetailRow
                        icon={<UserIcon className="size-3.5"/>}
                        label="Giới tính"
                        value={p && p.gender != null ? genderLabel[p.gender] : null}
                    />
                    <DetailRow
                        icon={<Calendar className="size-3.5"/>}
                        label="Ngày sinh"
                        value={formatDate(p && p.dateOfBirth)}
                    />
                    <DetailRow
                        icon={<Briefcase className="size-3.5"/>}
                        label="Nghề nghiệp"
                        value={p && p.occupation}
                    />
                    <DetailRow
                        icon={<MapPin className="size-3.5"/>}
                        label="Địa chỉ"
                        value={
                            p && [p.address, p.city, p.country].filter(Boolean).join(", ") || null
                        }
                    />
                    <DetailRow
                        icon={<Globe className="size-3.5"/>}
                        label="Quốc gia"
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
                onSuccess={() => navigate("/students")}
            />
        </div>
    )
}
