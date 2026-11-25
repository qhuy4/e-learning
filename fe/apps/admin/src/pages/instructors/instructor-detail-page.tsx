import {useState} from "react"
import {useParams, useNavigate} from "react-router"
import {
    ArrowLeft,
    Mail,
    Calendar,
    User as UserIcon,
    Pencil,
    Trash2,
    RefreshCw,
    Award,
    Star,
    Users,
    DollarSign,
    CreditCard,
    Building2,
    Check,
} from "lucide-react"

import {Button} from "@fe/components/ui/button"
import {Badge} from "@fe/components/ui/badge"
import {Avatar, AvatarFallback, AvatarImage} from "@fe/components/ui/avatar"
import {Separator} from "@fe/components/ui/separator"
import {UserStatus} from "@/features/users/constants/users.constants.ts";
import {useInstructor} from "@/features/instructors/hook/use-instructors.ts";
import {formatDate} from "@/features/instructors/utils.ts";
import {PageSkeleton} from "@/features/users/components/skeleton.tsx";
import {ReloadingOverlay} from "@/components/common/page/reloading-overlay.tsx";
import {
    approvalStatusLabel,
    approvalStatusClassName,
} from "@/features/instructors/constants/instructor.constants.ts";
import {userStatusLabel} from "@/features/users/constants/users.constants.ts";
import {DeleteConfirmDialog} from "@/features/users/components/delete-confirm-diialog.tsx";
import {usePayoutAccounts, useDeletePayoutAccount} from "@/features/instructors/hooks/use-payout-accounts.ts";
import {accountTypeLabel, accountTypeClassName, type AccountType, type PayoutAccount} from "@/features/instructors/types/payout-account.ts";
import {toast} from "sonner";
import {ConfirmDialog} from "@/components/confirm-dialog.tsx";
import {useConfirmDialog} from "@/hooks/use-confirm-dialog.ts";

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


export function InstructorDetailPage() {
    const {id} = useParams<{ id: string }>()
    const navigate = useNavigate()
    const instructorId = Number(id)

    const {data: instructor, isLoading, isError, refetch, isFetching} = useInstructor(instructorId)

    const [deleteOpen, setDeleteOpen] = useState(false)

    if (isLoading) return <PageSkeleton withAvatar/>

    if (isError || !instructor) {
        return (
            <div className="p-6 mx-auto">
                <Button variant="ghost" size="sm" onClick={() => navigate("/instructors")} className="mb-6 -ml-2">
                    <ArrowLeft className="size-4"/>
                    Quay lại danh sách
                </Button>
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <UserIcon className="size-12 text-muted-foreground mb-4"/>
                    <h2 className="text-lg font-semibold">Không tìm thấy giảng viên</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Giảng viên bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                    </p>
                    <Button className="mt-6" onClick={() => navigate("/instructors")}>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        )
    }

    const p = instructor.profile
    return (
        <div className="p-6 mx-auto space-y-6 relative">
            <ReloadingOverlay isFetching={isFetching}/>

            {/* Back */}
            <Button variant="ghost" size="sm" onClick={() => navigate("/instructors")} className="-ml-2">
                <ArrowLeft className="size-4"/>
                Quay lại danh sách
            </Button>

            <div className="flex gap-5 justify-between">
                {/* Profile Card */}
                <div className="rounded-xl border bg-card p-6 space-y-4 grow-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar size="lg" className="size-16 text-lg">
                                {p?.headline ? (
                                    <AvatarImage src="" alt=""/>
                                ) : null}
                                <AvatarFallback>
                                    {instructor.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1.5">
                                <h1 className="text-xl font-bold leading-tight">{instructor.name}</h1>
                                <p className="text-sm text-muted-foreground">{instructor.email}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant={statusVariant(instructor.status)}>
                                        {userStatusLabel[instructor.status]}
                                    </Badge>
                                    {p && (
                                        <Badge className={approvalStatusClassName[p.approvalStatus]}>
                                            {approvalStatusLabel[p.approvalStatus]}
                                        </Badge>
                                    )}
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
                                Tải lại
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/instructors/${instructor.id}/edit`)}
                            >
                                <Pencil className="size-3.5"/>
                                Sửa
                            </Button>
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

                {/* Account & Approval Details */}
                <div className="rounded-xl border bg-card p-6 space-y-4 grow-1">
                    <h2 className="text-sm font-semibold">Thông tin tài khoản</h2>
                    <Separator/>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailRow
                            icon={<Mail className="size-3.5"/>}
                            label="Email"
                            value={instructor.email}
                        />
                        {p && (
                            <>
                                <DetailRow
                                    icon={<Award className="size-3.5"/>}
                                    label="Trạng thái duyệt"
                                    value={
                                        <Badge className={approvalStatusClassName[p.approvalStatus]}>
                                            {approvalStatusLabel[p.approvalStatus]}
                                        </Badge>
                                    }
                                />
                                <DetailRow
                                    icon={<Calendar className="size-3.5"/>}
                                    label="Ngày duyệt"
                                    value={formatDate(p.approvedAt)}
                                />
                                <DetailRow
                                    icon={<Star className="size-3.5"/>}
                                    label="Đánh giá trung bình"
                                    value={p.avgRating != null ? `${Number(p.avgRating).toFixed(1)}/5` : "—"}
                                />
                                <DetailRow
                                    icon={<Users className="size-3.5"/>}
                                    label="Tổng học viên"
                                    value={p.totalStudents != null ? Number(p.totalStudents) : 0}
                                />
                                <DetailRow
                                    icon={<DollarSign className="size-3.5"/>}
                                    label="Phần trăm chia sẻ"
                                    value={p.revenueSharePct ? `${Number(p.revenueSharePct)}%` : "—"}
                                />
                                <DetailRow
                                    icon={<DollarSign className="size-3.5"/>}
                                    label="Tổng thu nhập"
                                    value={p.totalEarned ? `$${Number(p.totalEarned).toLocaleString()}` : "$0"}
                                />
                                <DetailRow
                                    icon={<DollarSign className="size-3.5"/>}
                                    label="Chờ thanh toán"
                                    value={p.pendingPayout ? `$${Number(p.pendingPayout).toLocaleString()}` : "$0"}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <DeleteConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                user={instructor}
                onSuccess={() => navigate("/instructors")}
            />

            {/* Payout Accounts Section */}
            {p && <PayoutAccountsSection instructorProfileId={String(p.id)} />}
        </div>
    )
}

function PayoutAccountsSection({instructorProfileId}: {instructorProfileId: string}) {
    const {data, isLoading} = usePayoutAccounts(instructorProfileId);
    const deleteMutation = useDeletePayoutAccount();
    const {confirm, confirmState, handleConfirm, handleCancel} = useConfirmDialog();
    const accounts = data?.data ?? [];

    const handleDelete = async (account: PayoutAccount) => {
        const confirmed = await confirm({
            title: "Xóa tài khoản thanh toán",
            description: `Tài khoản của ${account.accountHolderName} sẽ bị xóa và không thể dùng cho các đợt thanh toán mới.`,
            confirmLabel: "Xóa tài khoản",
            variant: "danger",
        });
        if (!confirmed) return;

        const loadingId = toast.loading("Đang xóa tài khoản...");
        deleteMutation.mutate(account.id, {
            onSuccess: () => {
                toast.success("Đã xóa tài khoản thanh toán", {id: loadingId});
            },
            onError: (error: unknown) => {
                const msg = error instanceof Error ? error.message : "Không thể xóa";
                toast.error(msg, {id: loadingId});
            },
        });
    };

    return (
        <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CreditCard className="size-4 text-muted-foreground"/>
                    <h2 className="text-sm font-semibold">Tài khoản thanh toán</h2>
                </div>
                <Badge variant="secondary">{accounts.length}</Badge>
            </div>
            <Separator/>

            {isLoading ? (
                <div className="text-sm text-muted-foreground py-4 text-center">Đang tải...</div>
            ) : accounts.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                    Chưa có tài khoản thanh toán nào.
                </div>
            ) : (
                <div className="space-y-3">
                    {accounts.map((account) => (
                        <div
                            key={account.id}
                            className="flex items-center justify-between rounded-lg border p-4"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                                    <Building2 className="size-4 text-muted-foreground"/>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium">{account.accountHolderName}</span>
                                        <Badge className={accountTypeClassName[account.accountType as AccountType] ?? ""}>
                                            {accountTypeLabel[account.accountType as AccountType] ?? account.accountType}
                                        </Badge>
                                        {account.isPrimary && (
                                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                Chính
                                            </Badge>
                                        )}
                                        {account.isVerified && (
                                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                <Check className="size-3 mr-1"/>
                                                Đã xác minh
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {account.bankName && `${account.bankName}`}
                                        {account.bankBranch && ` - ${account.bankBranch}`}
                                        {account.accountNumber && ` | STK: ${account.accountNumber}`}
                                        {account.paypalEmail && ` | ${account.paypalEmail}`}
                                        {` (${account.currency})`}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive shrink-0"
                                onClick={() => void handleDelete(account)}
                                disabled={deleteMutation.isPending}
                            >
                                <Trash2 className="size-3.5"/>
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title}
                description={confirmState.description}
                confirmLabel={confirmState.confirmLabel}
                cancelLabel={confirmState.cancelLabel}
                variant={confirmState.variant}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </div>
    );
}
