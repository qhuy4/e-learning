import { Badge } from "@fe/components/ui/badge";
import { Card } from "@fe/components/ui/card";
import {
    Calendar as CalendarIcon,
    Clock,
    Quote,
    ShieldCheck,
    Star,
    Video,
} from "lucide-react";
import type { InstructorListItem } from "../../types/instructor.type";

const formatVnd = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(amount);

interface InstructorSummaryCardProps {
    instructor: InstructorListItem;
    summaryDate: string;
    selectedTimeLabel: string;
    durationMinutes: number;
}

export function InstructorSummaryCard({
    instructor,
    summaryDate,
    selectedTimeLabel,
    durationMinutes,
}: InstructorSummaryCardProps) {
    const total = Math.round((instructor.hourlyRate * durationMinutes) / 60);
    return (
        <Card className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-5">
            <div className="flex items-start gap-4">
                <div className="relative size-20 shrink-0">
                    {instructor.avatarUrl ? (
                        <img
                            src={instructor.avatarUrl}
                            alt={instructor.name}
                            className="size-20 rounded-2xl object-cover border border-border"
                        />
                    ) : (
                        <div className="size-20 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-2xl font-bold border border-primary/20">
                            {instructor.name[0]}
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-m3-secondary flex items-center justify-center">
                        <span className="size-2 rounded-full bg-white animate-pulse" />
                    </div>
                </div>

                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-lg font-bold text-foreground truncate">
                            {instructor.name}
                        </h3>
                        <ShieldCheck className="size-4 text-m3-secondary" />
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">
                        {instructor.headline || "Giảng viên ESL được chứng nhận Cambridge"}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 text-xs">
                        <div className="flex items-center text-accent-foreground font-bold">
                            <Star className="size-3.5 fill-current text-accent-foreground" />
                            <span className="ml-1">
                                {Number(instructor.avgRating || 0).toFixed(1)}
                            </span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                            {instructor.totalStudents} học viên
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                <Badge
                    variant="outline"
                    className="bg-muted text-foreground border-border font-semibold px-2.5 py-1 text-xs rounded-full"
                >
                    Giảng viên CEFR
                </Badge>
                <Badge
                    variant="outline"
                    className="bg-muted text-foreground border-border font-semibold px-2.5 py-1 text-xs rounded-full"
                >
                    {instructor.totalStudents} học viên
                </Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-muted/40 text-xs leading-relaxed text-muted-foreground italic relative">
                <Quote className="size-4 text-primary/40 mb-1" />
                <p>
                    "
                    {instructor.bio ||
                        "Trong 15 phút này, chúng ta sẽ không làm những bài tập ngữ pháp nhàm chán. Chúng ta sẽ nói tự nhiên, chỉ ra điều đang cản trở nhịp nói của bạn, và đưa bạn 3 mẹo nhỏ áp dụng ngay."}
                    "
                </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <CalendarIcon className="size-4 text-primary" />
                        Ngày & giờ
                    </span>
                    <span className="font-bold text-foreground text-right">
                        {summaryDate}
                        {selectedTimeLabel
                            ? ` • ${selectedTimeLabel}`
                            : " • Chọn giờ"}
                    </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="size-4 text-accent-foreground" />
                        Thời lượng
                    </span>
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-m3-secondary/15 text-m3-secondary text-[11px] font-bold rounded-full">
                            {durationMinutes} phút
                        </span>
                        {durationMinutes} phút
                    </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="size-4 text-m3-secondary" />
                        Chi phí buổi học
                    </span>
                    <span className="font-extrabold text-m3-secondary text-sm text-right">
                        {formatVnd(total)}
                    </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Đơn giá</span>
                    <span className="font-semibold text-foreground">
                        {formatVnd(instructor.hourlyRate)}/giờ
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <Video className="size-4 text-muted-foreground" />
                        Hình thức
                    </span>
                    <span className="font-semibold text-foreground">
                        Phòng học trực tuyến
                    </span>
                </div>
            </div>
        </Card>
    );
}
