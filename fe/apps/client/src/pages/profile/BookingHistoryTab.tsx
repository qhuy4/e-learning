import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
    CalendarClock,
    CalendarDays,
    CalendarX,
    CheckCircle2,
    Clock,
    Home,
    RefreshCw,
    Search,
    Video,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { Card, CardContent } from "@fe/components/ui/card";
import { Input } from "@fe/components/ui/input";
import { Skeleton } from "@fe/components/ui/skeleton";
import { Pagination } from "@fe/components/common/Pagination";
import {
    bookingDurationMinutes,
    getBookingPhase,
    getPhaseBadge,
    isBookingJoinable,
    useMyBookings,
    type BookingPhase,
} from "../meeting/booking.service";

const PAGE_SIZE = 6;

type TabKey = "all" | BookingPhase;

const TABS: { key: TabKey; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "upcoming", label: "Sắp diễn ra" },
    { key: "completed", label: "Đã hoàn thành" },
    { key: "cancelled", label: "Đã hủy" },
];

function formatDateLabel(date: string, now: Date): string {
    const d = new Date(`${date.slice(0, 10)}T00:00:00`);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return "Hôm nay";
    if (diff === 1) return "Ngày mai";
    return d.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export const BookingHistoryTab = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState<TabKey>("all");
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(1);

    const { data, isLoading } = useMyBookings(user?.id);

    const now = new Date();
    const bookings = data?.data ?? [];

    const counts: Record<TabKey, number> = {
        all: bookings.length,
        upcoming: 0,
        completed: 0,
        cancelled: 0,
    };
    bookings.forEach((b) => {
        counts[getBookingPhase(b, now)] += 1;
    });

    const kw = keyword.trim().toLowerCase();
    const filtered = bookings.filter((b) => {
        if (tab !== "all" && getBookingPhase(b, now) !== tab) return false;
        if (!kw) return true;
        return `${b.instructorName} ${b.notes ?? ""} ${b.bookingDate}`
            .toLowerCase()
            .includes(kw);
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const visible = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const totalHours =
        bookings
            .filter((b) => getBookingPhase(b, now) === "completed")
            .reduce((sum, b) => sum + bookingDurationMinutes(b), 0) / 60;

    const metrics = [
        {
            label: "Tổng giờ đã học",
            value: (Math.round(totalHours * 10) / 10).toString(),
            unit: "giờ",
            icon: Clock,
            color: "text-[#146a5f]",
        },
        {
            label: "Buổi đã hoàn thành",
            value: String(counts.completed),
            unit: "buổi",
            icon: CheckCircle2,
            color: "text-[#F38181]",
        },
        {
            label: "Sắp diễn ra",
            value: String(counts.upcoming),
            unit: "buổi",
            icon: CalendarClock,
            color: "text-amber-600",
        },
        {
            label: "Đã hủy",
            value: String(counts.cancelled),
            unit: "buổi",
            icon: CalendarX,
            color: "text-muted-foreground",
        },
    ];

    const selectTab = (key: TabKey) => {
        setTab(key);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <Link
                    to="/"
                    className="flex items-center gap-1 hover:text-[#F38181] transition-colors"
                >
                    <Home className="h-3.5 w-3.5" />
                    Home
                </Link>
                <span>/</span>
                <span className="font-semibold text-foreground">
                    Lịch sử đặt lịch
                </span>
            </nav>

            <div className="rounded-2xl border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-2xl space-y-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#a4f1e3] px-3 py-1 text-xs font-semibold text-[#146a5f]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Phiên học 1:1
                    </span>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Lịch sử đặt lịch
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Theo dõi các buổi học 1:1 với giảng viên, xem lại những
                        buổi đã học và đặt lịch mới.
                    </p>
                </div>
                <Button
                    className="rounded-full bg-[#F38181] text-white hover:bg-[#e56d6d] shrink-0"
                    onClick={() => navigate("/instructors")}
                >
                    <CalendarDays className="h-4 w-4 mr-1.5" />
                    Đặt lịch mới
                </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m) => (
                    <div
                        key={m.label}
                        className="rounded-2xl border bg-card p-4 flex flex-col justify-between gap-3"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                                {m.label}
                            </span>
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                <m.icon className={`h-4 w-4 ${m.color}`} />
                            </span>
                        </div>
                        <p className="text-2xl font-bold leading-none">
                            {m.value}{" "}
                            <span className="text-sm font-normal text-muted-foreground">
                                {m.unit}
                            </span>
                        </p>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border bg-card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => selectTab(t.key)}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                                tab === t.key
                                    ? "bg-[#F38181] text-white shadow-sm"
                                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                            }`}
                        >
                            {t.label} ({counts[t.key]})
                        </button>
                    ))}
                </div>
                <div className="relative w-full lg:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Tìm theo giảng viên, ghi chú, ngày..."
                        className="rounded-full pl-9"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            ) : bookings.length === 0 ? (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        Bạn chưa có buổi học nào. Tìm giảng viên để bắt đầu.
                        <div className="mt-4">
                            <Button
                                className="rounded-full"
                                onClick={() => navigate("/instructors")}
                            >
                                Tìm giảng viên
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : filtered.length === 0 ? (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        Không tìm thấy buổi học nào khớp với bộ lọc.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {visible.map((b) => {
                        const phase = getBookingPhase(b, now);
                        const badge = getPhaseBadge(b, now);
                        const joinable = isBookingJoinable(b, now);
                        const duration = bookingDurationMinutes(b);
                        return (
                            <Card
                                key={b.id}
                                className={`relative overflow-hidden ${
                                    phase === "cancelled" ? "opacity-70" : ""
                                }`}
                            >
                                {phase === "upcoming" && (
                                    <div className="absolute inset-x-0 top-0 h-1.5 bg-[#146a5f]" />
                                )}
                                <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4 min-w-0">
                                        <div className="relative shrink-0">
                                            <img
                                                alt={b.instructorName}
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(b.instructorName || "M")}&background=146a5f&color=fff&bold=true`}
                                                className="h-14 w-14 rounded-full object-cover"
                                            />
                                            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted shadow-sm">
                                                {phase === "completed" ? (
                                                    <CheckCircle2 className="h-3 w-3 text-[#146a5f]" />
                                                ) : phase === "cancelled" ? (
                                                    <CalendarX className="h-3 w-3 text-muted-foreground" />
                                                ) : (
                                                    <Video className="h-3 w-3 text-[#F38181]" />
                                                )}
                                            </span>
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={`border-0 ${badge.className}`}
                                                >
                                                    {badge.label}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    • {duration} phút
                                                </span>
                                            </div>
                                            <h2
                                                className={`font-semibold leading-snug ${
                                                    phase === "cancelled"
                                                        ? "text-muted-foreground line-through"
                                                        : ""
                                                }`}
                                            >
                                                {b.notes?.trim()
                                                    ? b.notes
                                                    : `Buổi học 1:1 với ${b.instructorName}`}
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Với{" "}
                                                <span className="font-semibold text-foreground">
                                                    {b.instructorName}
                                                </span>
                                            </p>
                                            <p className="flex items-center gap-1.5 text-sm text-[#146a5f]">
                                                <CalendarDays className="h-4 w-4 shrink-0" />
                                                {formatDateLabel(
                                                    b.bookingDate,
                                                    now,
                                                )}{" "}
                                                • {b.startTime.slice(0, 5)}–
                                                {b.endTime.slice(0, 5)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        {joinable && (
                                            <Button
                                                className="rounded-full bg-[#F38181] text-white hover:bg-[#e56d6d]"
                                                onClick={() =>
                                                    navigate(
                                                        `/meeting/${b.meetingRoomId}`,
                                                    )
                                                }
                                            >
                                                <Video className="h-4 w-4 mr-1.5" />
                                                Vào lớp
                                            </Button>
                                        )}
                                        {phase !== "cancelled" && (
                                            <Button
                                                variant="outline"
                                                className="rounded-full"
                                                onClick={() =>
                                                    navigate("/instructors")
                                                }
                                            >
                                                <RefreshCw className="h-4 w-4 mr-1.5" />
                                                Đặt lại
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {filtered.length > 0 && (
                <Pagination
                    page={currentPage}
                    onPageChange={setPage}
                    totalPages={totalPages}
                    totalItems={filtered.length}
                    limit={PAGE_SIZE}
                    itemLabel="buổi học"
                />
            )}
        </div>
    );
};
