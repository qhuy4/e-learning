import {useParams, useNavigate} from "react-router"
import {ArrowLeft, Star, Calendar, User, BookOpen} from "lucide-react"

import {Button} from "@fe/components/ui/button"
import {Badge} from "@fe/components/ui/badge"
import {Separator} from "@fe/components/ui/separator"
import {useReview, useUpdateReviewStatus} from "@/features/reviews/hook/use-review.ts"
import {reviewStatusLabel, reviewStatusClassName} from "@/features/reviews/types/review.ts"
import type {ReviewStatus} from "@/features/reviews/types/review.ts"
import {toast} from "sonner";

function formatDate(date: Date | null) {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

function Stars({rating}: {rating: number}) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`size-5 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                />
            ))}
        </div>
    )
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
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium break-all">{value ?? "—"}</p>
            </div>
        </div>
    )
}

export default function ReviewDetailPage() {
    const {id} = useParams<{ id: string }>()
    const navigate = useNavigate()

    const {data: review, isLoading, isError} = useReview(id ?? "")
    const updateStatusMutation = useUpdateReviewStatus()

    function handleUpdateStatus(status: number) {
        if (!id) return
        updateStatusMutation.mutate(
            {id, status},
            {
                onSuccess: () => {
                    toast.success("Cập nhật trạng thái thành công")
                },
                onError: () => {
                    toast.error("Có lỗi xảy ra")
                },
            }
        )
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-32 bg-muted rounded"/>
                    <div className="h-64 bg-muted rounded-xl"/>
                </div>
            </div>
        )
    }

    if (isError || !review) {
        return (
            <div className="p-6 mx-auto">
                <Button variant="ghost" size="sm" onClick={() => navigate("/reviews")} className="mb-6 -ml-2">
                    <ArrowLeft className="size-4"/>
                    Quay lại danh sách
                </Button>
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Star className="size-12 text-muted-foreground mb-4"/>
                    <h2 className="text-lg font-semibold">Không tìm thấy đánh giá</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Đánh giá bạn tìm kiếm không tồn tại hoặc đã bị xóa.
                    </p>
                    <Button className="mt-6" onClick={() => navigate("/reviews")}>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        )
    }

    const status = review.status as ReviewStatus

    return (
        <div className="p-6 mx-auto space-y-6">
            <Button variant="ghost" size="sm" onClick={() => navigate("/reviews")} className="-ml-2">
                <ArrowLeft className="size-4"/>
                Quay lại danh sách
            </Button>

            <div className="rounded-xl border bg-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-xl font-bold">Chi tiết đánh giá</h1>
                        <div className="flex items-center gap-2">
                            <Badge className={reviewStatusClassName[status]}>
                                {reviewStatusLabel[status]}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {status !== 1 && (
                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(1)}>
                                Hiển thị
                            </Button>
                        )}
                        {status !== 2 && (
                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(2)}>
                                Ẩn
                            </Button>
                        )}
                        {status !== 3 && (
                            <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(3)}>
                                Vi phạm
                            </Button>
                        )}
                    </div>
                </div>

                <Separator/>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Đánh giá</p>
                        <Stars rating={review.rating}/>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Nội dung</p>
                        <p className="text-sm">{review.comment || "Không có nội dung"}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-4">
                <h2 className="text-sm font-semibold">Thông tin chi tiết</h2>
                <Separator/>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailRow
                        icon={<User className="size-3.5"/>}
                        label="Học viên"
                        value={review.user?.name || review.userId}
                    />
                    <DetailRow
                        icon={<BookOpen className="size-3.5"/>}
                        label="Khóa học"
                        value={review.course?.title || review.courseId}
                    />
                    <DetailRow
                        icon={<Calendar className="size-3.5"/>}
                        label="Ngày tạo"
                        value={formatDate(review.createdAt)}
                    />
                    <DetailRow
                        icon={<Calendar className="size-3.5"/>}
                        label="Cập nhật lần cuối"
                        value={formatDate(review.updatedAt)}
                    />
                </div>
            </div>
        </div>
    )
}
