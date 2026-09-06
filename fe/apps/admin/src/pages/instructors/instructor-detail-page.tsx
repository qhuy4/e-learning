import {useState} from "react"
import {useParams, useNavigate} from "react-router"
import {
    ArrowLeft,
    Mail,
    Calendar,
    User as UserIcon,
    Pencil,
    Trash2,
    CheckCircle,
    Ban,
    RefreshCw,
    Award,
    Star,
    Users,
    DollarSign,
} from "lucide-react"

import {Button} from "@fe/components/ui/button"
import {Badge} from "@fe/components/ui/badge"
import {Avatar, AvatarFallback, AvatarImage} from "@fe/components/ui/avatar"
import {Separator} from "@fe/components/ui/separator"
import {UserStatus} from "@/features/users/constants/users.constants.ts";
import {useInstructor} from "@/features/instructors/hook/use-instructors.ts";
import {getAvatarUrl} from "@/features/users/utils/ultis.ts";
import {formatDate} from "@/features/instructors/utils.ts";
import {PageSkeleton} from "@/features/users/components/skeleton.tsx";
import {ReloadingOverlay} from "@/components/common/page/reloading-overlay.tsx";
import {
    approvalStatusLabel,
    approvalStatusClassName,
} from "@/features/instructors/constants/instructor.constants.ts";
import {userStatusLabel} from "@/features/users/constants/users.constants.ts";
import {DeleteConfirmDialog} from "@/features/users/components/delete-confirm-diialog.tsx";
import type {Instructor} from "@/features/instructors/type/instructor.ts";

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
                    Back to Instructors
                </Button>
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <UserIcon className="size-12 text-muted-foreground mb-4"/>
                    <h2 className="text-lg font-semibold">Instructor not found</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        The instructor you are looking for does not exist or has been removed.
                    </p>
                    <Button className="mt-6" onClick={() => navigate("/instructors")}>
                        Back to Instructors
                    </Button>
                </div>
            </div>
        )
    }

    const p = instructor.profile
    const isBlocked = instructor.status === UserStatus.BLOCKED

    return (
        <div className="p-6 mx-auto space-y-6 relative">
            <ReloadingOverlay isFetching={isFetching}/>

            {/* Back */}
            <Button variant="ghost" size="sm" onClick={() => navigate("/instructors")} className="-ml-2">
                <ArrowLeft className="size-4"/>
                Back to Instructors
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
                                Reload
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/instructors/${instructor.id}/edit`)}
                            >
                                <Pencil className="size-3.5"/>
                                Edit
                            </Button>
                            {isBlocked ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                >
                                    <CheckCircle className="size-3.5"/>
                                    Unblock
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
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

                {/* Account & Approval Details */}
                <div className="rounded-xl border bg-card p-6 space-y-4 grow-1">
                    <h2 className="text-sm font-semibold">Account Details</h2>
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
                                    label="Approval Status"
                                    value={
                                        <Badge className={approvalStatusClassName[p.approvalStatus]}>
                                            {approvalStatusLabel[p.approvalStatus]}
                                        </Badge>
                                    }
                                />
                                <DetailRow
                                    icon={<Calendar className="size-3.5"/>}
                                    label="Approved At"
                                    value={formatDate(p.approvedAt)}
                                />
                                <DetailRow
                                    icon={<Star className="size-3.5"/>}
                                    label="Average Rating"
                                    value={p.avgRating != null ? `${Number(p.avgRating).toFixed(1)}/5` : "—"}
                                />
                                <DetailRow
                                    icon={<Users className="size-3.5"/>}
                                    label="Total Students"
                                    value={p.totalStudents != null ? Number(p.totalStudents) : 0}
                                />
                                <DetailRow
                                    icon={<DollarSign className="size-3.5"/>}
                                    label="Revenue Share"
                                    value={p.revenueSharePct ? `${Number(p.revenueSharePct)}%` : "—"}
                                />
                                <DetailRow
                                    icon={<DollarSign className="size-3.5"/>}
                                    label="Total Earned"
                                    value={p.totalEarned ? `$${Number(p.totalEarned).toLocaleString()}` : "$0"}
                                />
                                <DetailRow
                                    icon={<DollarSign className="size-3.5"/>}
                                    label="Pending Payout"
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
                user={instructor as any}
                onSuccess={() => navigate("/instructors")}
            />
        </div>
    )
}
