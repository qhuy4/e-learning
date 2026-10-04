import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
    Download,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    LogOut,
    MonitorSmartphone,
    Power,
    Shield,
    Trash2,
} from "lucide-react";
import { api, logout } from "@/shared/lib/axios";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@fe/components/ui/button";
import { Card, CardContent } from "@fe/components/ui/card";
import { Input } from "@fe/components/ui/input";
import { Skeleton } from "@fe/components/ui/skeleton";
import { useMyBookings } from "../meeting/booking.service";

interface MeSession {
    id: string;
    createdAt: string;
    expiresAt: string;
    isCurrent: boolean;
}

function passwordScore(pw: string): number {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    return score;
}

function isStrong(pw: string): boolean {
    return (
        pw.length >= 8 &&
        /[A-Z]/.test(pw) &&
        /[a-z]/.test(pw) &&
        /[^A-Za-z0-9]/.test(pw)
    );
}

const STRENGTH_LABELS = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];

function apiErrorMessage(err: unknown, fallback: string): string {
    const e = err as {
        response?: {
            status?: number;
            data?: { error?: { message?: string; details?: unknown } };
        };
    };
    if (e?.response?.status === 403) return "Mật khẩu hiện tại không đúng.";
    const details = e?.response?.data?.error?.details;
    if (Array.isArray(details) && typeof details[0] === "string") {
        return details[0];
    }
    return e?.response?.data?.error?.message ?? fallback;
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function PasswordInput({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
}) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <Input
                type={show ? "text" : "password"}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-full bg-muted/60 h-9 pr-10"
            />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                    show ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                }
            >
                {show ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}

export const SecurityTab = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [pwError, setPwError] = useState<string | null>(null);
    const [changing, setChanging] = useState(false);

    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);

    const { data: sessionsData, isLoading: sessionsLoading, refetch } =
        useQuery({
            queryKey: ["me-sessions"],
            queryFn: async (): Promise<MeSession[]> => {
                const res = await api.get("/auth/sessions");
                return res.data.data as MeSession[];
            },
        });
    const { data: bookingData } = useMyBookings(user?.id);
    const sessions = sessionsData ?? [];

    const score = passwordScore(newPw);
    const strengthColor =
        score <= 1
            ? "text-destructive"
            : score === 2
                ? "text-amber-600"
                : "text-[#146a5f]";
    const segmentColor =
        score <= 1
            ? "bg-destructive"
            : score === 2
                ? "bg-amber-500"
                : "bg-[#146a5f]";

    const onChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError(null);
        if (!currentPw || !newPw || !confirmPw) {
            setPwError("Vui lòng nhập đủ3 trường.");
            return;
        }
        if (newPw !== confirmPw) {
            setPwError("Mật khẩu xác nhận không khớp.");
            return;
        }
        if (!isStrong(newPw)) {
            setPwError(
                "Mật khẩu mới cần ≥8 ký tự, có chữ hoa, chữ thường và ký tự đặc biệt.",
            );
            return;
        }
        setChanging(true);
        try {
            await api.post("/auth/change-password", {
                currentPassword: currentPw,
                newPassword: newPw,
            });
            toast.success("Đã cập nhật mật khẩu.");
            setCurrentPw("");
            setNewPw("");
            setConfirmPw("");
        } catch (err: unknown) {
            setPwError(
                apiErrorMessage(err, "Không thể đổi mật khẩu. Thử lại sau."),
            );
        } finally {
            setChanging(false);
        }
    };

    const revokeSession = async (id: string) => {
        setRevokingId(id);
        try {
            await api.delete(`/auth/sessions/${id}`);
            toast.success("Đã đăng xuất thiết bị.");
            void refetch();
        } catch {
            toast.error("Không thể đăng xuất thiết bị.");
        } finally {
            setRevokingId(null);
        }
    };

    const revokeOthers = async () => {
        try {
            await api.delete("/auth/sessions/others");
            toast.success("Đã đăng xuất các thiết bị khác.");
            void refetch();
        } catch {
            toast.error("Không thể đăng xuất các thiết bị khác.");
        }
    };

    const exportData = async () => {
        setExporting(true);
        try {
            const meRes = await api.get("/users/me");
            const payload = {
                exportedAt: new Date().toISOString(),
                account: meRes.data.data,
                bookings: bookingData?.data ?? [],
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `piemind-data-export-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Đã tải dữ liệu cá nhân của bạn.");
        } catch {
            toast.error("Không thể xuất dữ liệu. Thử lại sau.");
        } finally {
            setExporting(false);
        }
    };

    const deleteAccount = async () => {
        setDeleting(true);
        try {
            await api.delete("/auth/account");
            logout();
            toast.success("Tài khoản của bạn đã được xóa.");
            navigate("/", { replace: true });
        } catch (err: unknown) {
            toast.error(apiErrorMessage(err, "Không thể xóa tài khoản."));
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <Card>
                <CardContent className="p-6 space-y-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F38181]/10 text-[#F38181]">
                                <KeyRound className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold leading-tight">
                                    Đổi mật khẩu
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Chọn mật khẩu mạnh để bảo vệ tài khoản của
                                    bạn.
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <Lock className="h-5 w-5" />
                        </span>
                    </div>

                    <form
                        className="space-y-4"
                        onSubmit={onChangePassword}
                    >
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold">
                                Mật khẩu hiện tại
                            </label>
                            <PasswordInput
                                value={currentPw}
                                onChange={setCurrentPw}
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold">
                                    Mật khẩu mới
                                </label>
                                <PasswordInput
                                    value={newPw}
                                    onChange={setNewPw}
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold">
                                    Xác nhận mật khẩu mới
                                </label>
                                <PasswordInput
                                    value={confirmPw}
                                    onChange={setConfirmPw}
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </div>
                        </div>

                        <div className="rounded-xl bg-muted/60 p-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Độ mạnh mật khẩu
                                </span>
                                <span
                                    className={`font-bold ${strengthColor}`}
                                >
                                    {newPw ? STRENGTH_LABELS[score] : "—"}
                                </span>
                            </div>
                            <div className="flex gap-1.5">
                                {[0, 1, 2, 3].map((i) => (
                                    <span
                                        key={i}
                                        className={`h-2 flex-1 rounded-full transition-colors ${
                                            i < score
                                                ? segmentColor
                                                : "bg-background"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {pwError && (
                            <p className="text-sm font-semibold text-destructive">
                                {pwError}
                            </p>
                        )}

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="rounded-full bg-[#F38181] text-white hover:bg-[#e56d6d]"
                                disabled={changing}
                            >
                                {changing
                                    ? "Đang cập nhật..."
                                    : "Cập nhật mật khẩu"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#146a5f]/10 text-[#146a5f]">
                                <MonitorSmartphone className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold leading-tight">
                                    Thiết bị kết nối
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Các phiên đăng nhập đang hoạt động trên tài
                                    khoản của bạn.
                                </p>
                            </div>
                        </div>
                    </div>

                    {sessionsLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Không có phiên hoạt động nào.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {sessions.map((s) => (
                                <div
                                    key={s.id}
                                    className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 p-4"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                                s.isCurrent
                                                    ? "bg-[#a4f1e3] text-[#146a5f]"
                                                    : "bg-background text-muted-foreground"
                                            }`}
                                        >
                                            <MonitorSmartphone className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <span className="text-sm font-bold">
                                                    {s.isCurrent
                                                        ? "Phiên hiện tại"
                                                        : "Thiết bị khác"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Đăng nhập{" "}
                                                    {formatDateTime(
                                                        s.createdAt,
                                                    )}
                                                </span>
                                            </div>
                                            {s.isCurrent ? (
                                                <span className="mt-1 inline-flex items-center gap-1.5">
                                                    <span className="h-2 w-2 rounded-full bg-[#146a5f] animate-pulse" />
                                                    <span className="text-xs font-bold uppercase tracking-wider text-[#146a5f]">
                                                        Đang hoạt động
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="mt-1 block text-xs text-muted-foreground">
                                                    Hết hạn{" "}
                                                    {formatDateTime(
                                                        s.expiresAt,
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {!s.isCurrent && (
                                        <button
                                            type="button"
                                            title="Thu hồi phiên đăng nhập"
                                            onClick={() =>
                                                void revokeSession(s.id)
                                            }
                                            disabled={revokingId === s.id}
                                            className="shrink-0 rounded-full p-2 text-[#F38181] hover:bg-[#F38181]/10 transition-colors disabled:opacity-50"
                                        >
                                            <LogOut className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {sessions.length > 1 && (
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => void revokeOthers()}
                            >
                                <Power className="h-4 w-4 mr-1.5" />
                                Đăng xuất khỏi tất cả thiết bị khác
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <Shield className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold leading-tight">
                                    Quyền riêng tư dữ liệu
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Tải bản sao dữ liệu của bạn hoặc xóa vĩnh
                                    viễn tài khoản.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-muted/50 p-4">
                        <button
                            type="button"
                            onClick={() => void exportData()}
                            disabled={exporting}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#146a5f] hover:underline disabled:opacity-50 self-start"
                        >
                            <Download className="h-4 w-4" />
                            {exporting
                                ? "Đang xuất dữ liệu..."
                                : "Tải dữ liệu cá nhân của tôi (GDPR)"}
                        </button>

                        {confirmDelete ? (
                            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-destructive/10 p-3">
                                <span className="text-sm font-semibold text-destructive">
                                    Xóa vĩnh viễn tài khoản? Hành động này không
                                    thể hoàn tác.
                                </span>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full"
                                    disabled={deleting}
                                    onClick={() => setConfirmDelete(false)}
                                >
                                    Huỷ
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="rounded-full bg-destructive text-white hover:bg-destructive/90"
                                    disabled={deleting}
                                    onClick={() => void deleteAccount()}
                                >
                                    {deleting ? "Đang xóa..." : "Xóa"}
                                </Button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(true)}
                                className="inline-flex items-center gap-1.5 text-sm font-bold text-destructive hover:underline self-start sm:self-auto"
                            >
                                <Trash2 className="h-4 w-4" />
                                Xóa tài khoản
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
