import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import {
    CalendarDays,
    CheckCircle2,
    Clock,
    History,
    Home,
    ImagePlus,
    Plus,
    Save,
    Shield,
    Target,
    Trash2,
    User as UserIcon,
    UserRound,
    Video,
    XCircle,
} from "lucide-react";
import { api } from "@/shared/lib/axios";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@fe/components/ui/button";
import { Card, CardContent } from "@fe/components/ui/card";
import { Input } from "@fe/components/ui/input";
import { Skeleton } from "@fe/components/ui/skeleton";
import {
    getBookingPhase,
    isBookingJoinable,
    bookingDurationMinutes,
    useMyBookings,
} from "../meeting/booking.service";
import { BookingHistoryTab } from "./BookingHistoryTab";
import { SecurityTab } from "./SecurityTab";

type TabKey = "profile" | "history" | "security";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const GOALS = [
    {
        key: "fluency",
        title: "Giao tiếp trôi chảy (mục tiêu B2)",
        tag: "Chính",
        desc: "Tập trung dùng idiom tự nhiên, giảm ngập ngừng và lắp ráp câu nhanh.",
    },
    {
        key: "ielts",
        title: "IELTS Academic band 7.5+",
        tag: "Thi cử",
        desc: "Diễn đạt học thuật, đa dạng từ vựng và mạch Argument Task 2.",
    },
    {
        key: "work",
        title: "English nơi công sở",
        tag: "Công việc",
        desc: "Phát biểu trong meeting, pitch thuyết phục và giao tiếp liên văn hóa.",
    },
];

const COMMITMENTS = [
    { value: "10", label: "Nhẹ nhàng" },
    { value: "15", label: "Ổn định" },
    { value: "30", label: "Tăng tốc" },
];

const SKILLS = [
    { key: "pronunciation", label: "Phát âm & âm tiết" },
    { key: "hesitation", label: "Giảm ngập ngừng" },
    { key: "idioms", label: "Cách diễn đạt idiomatic" },
    { key: "grammar", label: "Chỉnh ngữ pháp" },
    { key: "listening", label: "Nghe tinh tế" },
];

const TIMEZONES = [
    { value: "GMT+07:00", label: "(GMT+07:00) Giờ Việt Nam (ICT)" },
    { value: "GMT+01:00", label: "(GMT+01:00) Giờ Trung Âu (CET)" },
    { value: "GMT+00:00", label: "(GMT+00:00) Giờ Tây Âu (WET)" },
    { value: "GMT-05:00", label: "(GMT-05:00) Giờ Eastern (EST)" },
];

const LANGUAGES = ["Vietnamese", "Spanish", "Japanese", "Korean", "French"];

function loadPref(key: string, fallback: string): string {
    return localStorage.getItem(key) ?? fallback;
}

function loadSkills(): string[] {
    try {
        const raw = localStorage.getItem("profile:skills");
        if (raw) return JSON.parse(raw) as string[];
    } catch {
        /* ignore */
    }
    return ["pronunciation", "hesitation", "idioms"];
}

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

export const ProfilePage = () => {
    const { user, isAuthenticated, updateUser } = useAuth();
    const [params, setParams] = useSearchParams();
    const rawTab = params.get("tab");
    const tab: TabKey =
        rawTab === "history"
            ? "history"
            : rawTab === "security"
                ? "security"
                : "profile";

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState(user?.name ?? "");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [timezone, setTimezone] = useState(() =>
        loadPref("profile:timezone", "GMT+07:00"),
    );
    const [language, setLanguage] = useState(() =>
        loadPref("profile:language", "Vietnamese"),
    );
    const [goal, setGoal] = useState(() => loadPref("profile:goal", "fluency"));
    const [commitment, setCommitment] = useState(() =>
        loadPref("profile:commitment", "15"),
    );
    const [skills, setSkills] = useState<string[]>(loadSkills);
    const [saving, setSaving] = useState(false);

    const { data: bookingData, isLoading: bookingsLoading } = useMyBookings(
        user?.id,
    );

    if (!isAuthenticated || !user) {
        return (
            <main className="min-h-screen bg-background pt-28 pb-16">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <p className="text-muted-foreground">
                        Vui lòng đăng nhập để xem hồ sơ.
                    </p>
                    <Link to="/student/login">
                        <Button className="mt-4">Đăng nhập</Button>
                    </Link>
                </div>
            </main>
        );
    }

    const bookings = bookingData?.data ?? [];
    const now = new Date();
    const nextBooking = bookings
        .filter(
            (b) =>
                getBookingPhase(b, now) === "upcoming" && b.status === 2,
        )
        .sort((a, b) =>
            `${a.bookingDate}${a.startTime}`.localeCompare(
                `${b.bookingDate}${b.startTime}`,
            ),
        )[0];
    const stats = {
        hours:
            Math.round(
                (bookings
                    .filter((b) => getBookingPhase(b, now) === "completed")
                    .reduce((s, b) => s + bookingDurationMinutes(b), 0) /
                    60) *
                    10,
            ) / 10,
        total: bookings.length,
        completed: bookings.filter(
            (b) => getBookingPhase(b, now) === "completed",
        ).length,
        cancelled: bookings.filter(
            (b) => getBookingPhase(b, now) === "cancelled",
        ).length,
    };

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=F38181&color=fff&bold=true`;
    const storedAvatar = user.avatar
        ? user.avatar.startsWith("http")
            ? user.avatar
            : `${API_BASE}${user.avatar}`
        : null;
    const avatarSrc = avatarPreview ?? storedAvatar ?? fallbackAvatar;

    const selectTab = (next: TabKey) => {
        setParams(next === "profile" ? {} : { tab: next }, { replace: true });
    };

    const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Ảnh tối đa 5MB.");
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const removeAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const trimmed = name.trim() || user.name;
            if (trimmed !== user.name || avatarFile) {
                const fd = new FormData();
                fd.append("name", trimmed);
                fd.append("profile", JSON.stringify({}));
                if (avatarFile) fd.append("avatar", avatarFile);
                await api.patch("/users/me", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                const res = await api.get("/users/me");
                const me = res.data.data as {
                    name: string;
                    profile: { avatarUrl: string | null } | null;
                };
                updateUser({
                    ...user,
                    name: me.name,
                    avatar: me.profile?.avatarUrl ?? user.avatar,
                });
                setName(me.name);
                removeAvatar();
            }
            localStorage.setItem("profile:timezone", timezone);
            localStorage.setItem("profile:language", language);
            localStorage.setItem("profile:goal", goal);
            localStorage.setItem("profile:commitment", commitment);
            localStorage.setItem("profile:skills", JSON.stringify(skills));
            toast.success("Đã lưu hồ sơ & mục tiêu.");
        } catch {
            toast.error("Không thể lưu. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    const toggleSkill = (key: string) => {
        setSkills((prev) =>
            prev.includes(key)
                ? prev.filter((s) => s !== key)
                : [...prev, key],
        );
    };

    const setTab = (t: TabKey) => selectTab(t);

    return (
        <main className="min-h-screen bg-background pt-28 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
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
                                Cài đặt tài khoản
                            </span>
                        </nav>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Cài đặt & Mục tiêu
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            Quản lý hồ sơ cá nhân, mục tiêu học tập, lịch sử
                            các buổi học 1:1 và bảo mật tài khoản của bạn.
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto pb-1">
                    <nav className="flex items-center gap-2 min-w-max bg-muted p-1.5 rounded-full w-fit">
                        <button
                            type="button"
                            onClick={() => setTab("profile")}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                                tab === "profile"
                                    ? "bg-[#F38181] text-white shadow-sm font-semibold"
                                    : "text-muted-foreground hover:bg-background"
                            }`}
                        >
                            <UserIcon className="h-4 w-4" />
                            Hồ sơ cá nhân
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("history")}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                                tab === "history"
                                    ? "bg-[#F38181] text-white shadow-sm font-semibold"
                                    : "text-muted-foreground hover:bg-background"
                            }`}
                        >
                            <History className="h-4 w-4" />
                            Lịch sử đặt lịch
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("security")}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                                tab === "security"
                                    ? "bg-[#F38181] text-white shadow-sm font-semibold"
                                    : "text-muted-foreground hover:bg-background"
                            }`}
                        >
                            <Shield className="h-4 w-4" />
                            Bảo mật
                        </button>
                    </nav>
                </div>

                {tab === "history" ? (
                    <BookingHistoryTab />
                ) : tab === "security" ? (
                    <SecurityTab />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-8 space-y-6">
                            <Card>
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F38181]/10 text-[#F38181]">
                                            <UserRound className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <h2 className="text-xl font-bold leading-tight">
                                                Hồ sơ cơ bản
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Cập nhật danh tính và thông tin
                                                tài khoản của bạn.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-5 rounded-xl bg-muted/50 p-4">
                                        <img
                                            alt={user.name}
                                            src={avatarSrc}
                                            className="h-24 w-24 rounded-full object-cover shadow-sm ring-4 ring-background"
                                        />
                                        <div className="flex-1 space-y-2 text-center sm:text-left">
                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="rounded-full"
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                >
                                                    <ImagePlus className="h-4 w-4 mr-1.5" />
                                                    Tải ảnh mới
                                                </Button>
                                                {(avatarFile ||
                                                    avatarPreview) && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="rounded-full text-destructive hover:text-destructive"
                                                        onClick={removeAvatar}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1.5" />
                                                        Gỡ ảnh
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                JPG hoặc PNG. Tối đa 5MB.
                                            </p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/png,image/jpeg"
                                                className="hidden"
                                                onChange={onPickAvatar}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold">
                                                Họ và tên
                                            </label>
                                            <Input
                                                value={name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                                className="rounded-full bg-muted/60 h-9"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-bold">
                                                    Email
                                                </label>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#a4f1e3] px-2 py-0.5 text-[11px] font-semibold text-[#146a5f]">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Tài khoản đã xác thực
                                                </span>
                                            </div>
                                            <Input
                                                value={user.email}
                                                readOnly
                                                className="rounded-full bg-muted/60 h-9 text-muted-foreground"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold">
                                                Múi giờ
                                            </label>
                                            <select
                                                value={timezone}
                                                onChange={(e) =>
                                                    setTimezone(e.target.value)
                                                }
                                                className="w-full h-9 rounded-full bg-muted/60 px-4 text-sm outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                                            >
                                                {TIMEZONES.map((tz) => (
                                                    <option
                                                        key={tz.value}
                                                        value={tz.value}
                                                    >
                                                        {tz.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold">
                                                Ngôn ngữ mẹ đẻ
                                            </label>
                                            <select
                                                value={language}
                                                onChange={(e) =>
                                                    setLanguage(e.target.value)
                                                }
                                                className="w-full h-9 rounded-full bg-muted/60 px-4 text-sm outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                                            >
                                                {LANGUAGES.map((lang) => (
                                                    <option
                                                        key={lang}
                                                        value={lang}
                                                    >
                                                        {lang}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#146a5f]/10 text-[#146a5f]">
                                                <Target className="h-5 w-5" />
                                            </span>
                                            <div>
                                                <h2 className="text-xl font-bold leading-tight">
                                                    Mục tiêu học tập
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    Chọn mục tiêu chính và cam
                                                    kết hằng ngày của bạn.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold block">
                                            Mục tiêu đang hoạt động
                                        </label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {GOALS.map((g) => {
                                                const active = goal === g.key;
                                                return (
                                                    <button
                                                        key={g.key}
                                                        type="button"
                                                        onClick={() =>
                                                            setGoal(g.key)
                                                        }
                                                        className={`text-left flex items-start rounded-xl border p-4 transition-all ${
                                                            active
                                                                ? "bg-muted/60 ring-2 ring-[#F38181]"
                                                                : "bg-card hover:bg-muted/40"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`mt-0.5 mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-transform ${
                                                                active
                                                                    ? "bg-[#F38181] text-white scale-110"
                                                                    : "bg-muted text-transparent"
                                                            }`}
                                                        >
                                                            <span className="h-2 w-2 rounded-full bg-white" />
                                                        </span>
                                                        <span className="flex-1 min-w-0">
                                                            <span className="flex items-center justify-between gap-2">
                                                                <span className="font-semibold">
                                                                    {g.title}
                                                                </span>
                                                                <span
                                                                    className={`text-xs rounded-full px-2 py-0.5 shrink-0 ${
                                                                        active
                                                                            ? "bg-[#F38181]/15 text-[#9e3f42] font-bold"
                                                                            : "bg-muted text-muted-foreground"
                                                                    }`}
                                                                >
                                                                    {g.tag}
                                                                </span>
                                                            </span>
                                                            <span className="block text-sm text-muted-foreground mt-0.5">
                                                                {g.desc}
                                                            </span>
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold">
                                                Cam kết học mỗi ngày
                                            </label>
                                            <span className="text-xs text-[#146a5f] font-semibold">
                                                Gợi ý cho người bận rộn: 15 phút
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {COMMITMENTS.map((c) => {
                                                const active =
                                                    commitment === c.value;
                                                return (
                                                    <button
                                                        key={c.value}
                                                        type="button"
                                                        onClick={() =>
                                                            setCommitment(
                                                                c.value,
                                                            )
                                                        }
                                                        className={`relative rounded-xl py-3 px-2 text-center transition-colors ${
                                                            active
                                                                ? "bg-[#F38181] text-white shadow-sm"
                                                                : "bg-muted hover:bg-muted/70"
                                                        }`}
                                                    >
                                                        <span className="block text-sm font-bold">
                                                            {c.value} phút
                                                        </span>
                                                        <span
                                                            className={`block text-xs ${
                                                                active
                                                                    ? "text-white/90"
                                                                    : "text-muted-foreground"
                                                            }`}
                                                        >
                                                            {c.label}
                                                        </span>
                                                        {active && (
                                                            <span className="absolute -top-2 right-2 rounded-full bg-[#9e3f42] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                                                Đang chọn
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold block">
                                            Kỹ năng cần tập trung
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {SKILLS.map((s) => {
                                                const active = skills.includes(
                                                    s.key,
                                                );
                                                return (
                                                    <button
                                                        key={s.key}
                                                        type="button"
                                                        onClick={() =>
                                                            toggleSkill(s.key)
                                                        }
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors ${
                                                            active
                                                                ? "bg-muted font-medium"
                                                                : "bg-background border text-muted-foreground hover:bg-muted"
                                                        }`}
                                                    >
                                                        {active ? (
                                                            <CheckCircle2 className="h-4 w-4 text-[#146a5f]" />
                                                        ) : (
                                                            <Plus className="h-4 w-4" />
                                                        )}
                                                        {s.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="rounded-full text-muted-foreground"
                                    disabled={saving}
                                    onClick={() => {
                                        setName(user.name);
                                        removeAvatar();
                                        setTimezone(
                                            loadPref(
                                                "profile:timezone",
                                                "GMT+07:00",
                                            ),
                                        );
                                        setLanguage(
                                            loadPref(
                                                "profile:language",
                                                "Vietnamese",
                                            ),
                                        );
                                        setGoal(
                                            loadPref("profile:goal", "fluency"),
                                        );
                                        setCommitment(
                                            loadPref(
                                                "profile:commitment",
                                                "15",
                                            ),
                                        );
                                        setSkills(loadSkills());
                                    }}
                                >
                                    <XCircle className="h-4 w-4 mr-1.5" />
                                    Hoàn tác thay đổi
                                </Button>
                                <Button
                                    type="button"
                                    className="rounded-full bg-[#F38181] text-white hover:bg-[#e56d6d]"
                                    disabled={saving}
                                    onClick={handleSave}
                                >
                                    <Save className="h-4 w-4 mr-1.5" />
                                    {saving ? "Đang lưu..." : "Lưu hồ sơ & mục tiêu"}
                                </Button>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="text-lg font-bold">
                                        Buổi học tiếp theo
                                    </h3>
                                    {bookingsLoading ? (
                                        <Skeleton className="h-24 w-full" />
                                    ) : nextBooking ? (
                                        <div className="space-y-3">
                                            <div className="rounded-xl bg-[#146a5f]/5 p-4 space-y-1">
                                                <p className="text-xs font-semibold uppercase text-[#146a5f]">
                                                    {formatDateLabel(
                                                        nextBooking.bookingDate,
                                                        now,
                                                    )}
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {nextBooking.startTime.slice(
                                                        0,
                                                        5,
                                                    )}
                                                    –
                                                    {nextBooking.endTime.slice(
                                                        0,
                                                        5,
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Với{" "}
                                                    <span className="font-semibold text-foreground">
                                                        {
                                                            nextBooking.instructorName
                                                        }
                                                    </span>
                                                </p>
                                            </div>
                                            {isBookingJoinable(
                                                nextBooking,
                                                now,
                                            ) ? (
                                                <Button
                                                    className="w-full rounded-full bg-[#F38181] text-white hover:bg-[#e56d6d]"
                                                    onClick={() =>
                                                        (window.location.href = `/meeting/${nextBooking.meetingRoomId}`)
                                                    }
                                                >
                                                    <Video className="h-4 w-4 mr-1.5" />
                                                    Vào lớp
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    className="w-full rounded-full"
                                                    onClick={() =>
                                                        setTab("history")
                                                    }
                                                >
                                                    <CalendarDays className="h-4 w-4 mr-1.5" />
                                                    Xem lịch của tôi
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Không có buổi học nào sắp tới.{" "}
                                            <Link
                                                to="/instructors"
                                                className="text-[#9e3f42] font-semibold hover:underline"
                                            >
                                                Đặt lịch ngay
                                            </Link>
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold">
                                            Thống kê học tập
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full text-xs"
                                            onClick={() => setTab("history")}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </div>
                                    {bookingsLoading ? (
                                        <Skeleton className="h-32 w-full" />
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3 text-center">
                                            <div className="rounded-xl bg-muted p-3">
                                                <span className="block text-xl font-bold text-[#F38181]">
                                                    {stats.hours} giờ
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    Thời lượng đã học
                                                </span>
                                            </div>
                                            <div className="rounded-xl bg-muted p-3">
                                                <span className="block text-xl font-bold text-[#146a5f]">
                                                    {stats.completed}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    Buổi hoàn thành
                                                </span>
                                            </div>
                                            <div className="rounded-xl bg-muted p-3">
                                                <span className="block text-xl font-bold text-foreground">
                                                    {stats.total}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    Tổng số buổi
                                                </span>
                                            </div>
                                            <div className="rounded-xl bg-muted p-3">
                                                <span className="block text-xl font-bold text-muted-foreground">
                                                    {stats.cancelled}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    Đã hủy
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        Dữ liệu lấy từ lịch sử đặt lịch của bạn
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};
