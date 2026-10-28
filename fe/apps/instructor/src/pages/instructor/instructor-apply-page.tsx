import React, {useEffect, useState} from "react";
import {useSearchParams} from "react-router";
import {toast} from "sonner";
import {CheckCircle2, Clock3, FileText, Mail, Plus, Trash2,} from "lucide-react";
import {
    type InstructorApplicationCertificateView,
    type InstructorApplicationForm,
    instructorApplicationService,
} from "@/features/instructor-applications/services/instructor-application.service";
import {InstructorPublicLayout} from "@/pages/instructor/instructor-public-layout";
import {Badge} from "@fe/components/ui/badge";
import {Button} from "@fe/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@fe/components/ui/card";
import {Input} from "@fe/components/ui/input";
import {Label} from "@fe/components/ui/label";
import {Spinner} from "@fe/components/ui/spinner";
import {Textarea} from "@fe/components/ui/textarea";

interface CertificateDraft {
    key: string;
    file: File | null;
}

const ACCEPTED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const STATUS_LABELS: Record<string, string> = {
    PENDING_SUBMISSION: "Chờ bổ sung",
    PENDING_INFORMATION: "Cần bổ sung",
    PENDING_REVIEW: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Đã từ chối",
};

function getErrorMessage(error: unknown, fallback: string) {
    const err = error as {
        response?: { data?: { error?: { message?: string }; message?: string } };
        message?: string;
    };
    return (
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        fallback
    );
}

const emptyCertificate = (): CertificateDraft => ({
    key: crypto.randomUUID(),
    file: null,
});

export default function InstructorApplyPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const [loading, setLoading] = useState(Boolean(token));
    const [loadError, setLoadError] = useState<string | null>(
        token
            ? null
            : "Không tìm thấy mã đơn đăng ký. Vui lòng mở lại liên kết trong email.",
    );
    const [data, setData] = useState<InstructorApplicationForm | null>(null);

    const [fullName, setFullName] = useState("");
    const [headline, setHeadline] = useState("");
    const [bio, setBio] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [certificates, setCertificates] = useState<CertificateDraft[]>([
        emptyCertificate(),
    ]);
    const [existingCertificates, setExistingCertificates] = useState<
        InstructorApplicationCertificateView[]
    >([]);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        instructorApplicationService
            .getApplication(token)
            .then((result) => {
                setData(result);
                setExistingCertificates(result.certificates ?? []);
                setFullName(result.application.fullName ?? "");
                setHeadline(result.application.headline ?? "");
                setBio(result.application.bio ?? "");
                setWebsiteUrl(result.application.websiteUrl ?? "");
            })
            .catch((err: unknown) => {
                setLoadError(
                    getErrorMessage(err, "Liên kết không hợp lệ hoặc đã hết hạn."),
                );
            })
            .finally(() => setLoading(false));
    }, [token]);

    const handleFile = (id: string, fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;

        const valid: File[] = [];
        for (const file of Array.from(fileList)) {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                toast.error(`${file.name}: chỉ chấp nhận PDF, JPG, PNG hoặc WEBP.`);
                continue;
            }
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name}: kích thước tối đa 5MB.`);
                continue;
            }
            valid.push(file);
        }
        if (valid.length === 0) return;

        setErrorMessage(null);
        setCertificates((current) => {
            const [first, ...rest] = valid;
            const extra = rest.map((file) => ({...emptyCertificate(), file}));
            return current.flatMap((item) =>
                item.key === id ? [{...item, file: first}, ...extra] : [item],
            );
        });
    };

    const removeCertificate = (id: string) => {
        setCertificates((current) => {
            const next = current.filter((item) => item.key !== id);
            return next.length > 0 ? next : [emptyCertificate()];
        });
    };

    const handleDeleteExisting = async (certificateId: number) => {
        setErrorMessage(null);
        setDeletingId(certificateId);
        try {
            await instructorApplicationService.deleteCertificate(
                token,
                certificateId,
            );
            setExistingCertificates((current) =>
                current.filter((item) => item.id !== certificateId),
            );
            toast.success("Đã xóa chứng chỉ bị từ chối.");
        } catch (err: unknown) {
            setErrorMessage(
                getErrorMessage(err, "Không thể xóa chứng chỉ này."),
            );
        } finally {
            setDeletingId(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);

        if (!fullName.trim()) {
            setErrorMessage("Vui lòng nhập họ và tên.");
            return;
        }

        const files = certificates
            .map((item) => item.file)
            .filter((file): file is File => file !== null);

        if (files.length === 0 && existingCertificates.length === 0) {
            setErrorMessage("Vui lòng tải lên ít nhất một chứng chỉ.");
            return;
        }

        setSubmitting(true);
        try {
            await instructorApplicationService.submitApplication({
                token,
                fullName: fullName.trim(),
                headline: headline.trim() || undefined,
                bio: bio.trim() || undefined,
                websiteUrl: websiteUrl.trim() || undefined,
                files,
            });
            setSubmitted(true);
        } catch (err: unknown) {
            setErrorMessage(getErrorMessage(err, "Gửi đơn đăng ký thất bại."));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <InstructorPublicLayout className="max-w-3xl">
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner/>
                        Đang tải đơn đăng ký...
                    </div>
                </div>
            </InstructorPublicLayout>
        );
    }

    if (loadError) {
        return (
            <InstructorPublicLayout className="max-w-3xl">
                <Card className="mx-auto mt-[10vh] max-w-lg">
                    <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <FileText className="size-7"/>
                        </div>
                        <div>
                            <CardTitle>Không thể mở đơn đăng ký</CardTitle>
                            <CardDescription className="mt-1">{loadError}</CardDescription>
                        </div>
                    </CardContent>
                </Card>
            </InstructorPublicLayout>
        );
    }

    if (submitted) {
        return (
            <InstructorPublicLayout className="max-w-3xl">
                <Card className="mx-auto mt-[10vh] max-w-lg">
                    <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-7"/>
                        </div>
                        <div>
                            <CardTitle>Đã gửi đơn đăng ký Giảng viên</CardTitle>
                            <CardDescription className="mt-1">
                                Hồ sơ của bạn đang chờ đội ngũ xét duyệt. Kết quả sẽ được gửi
                                tới <strong>{data?.application.email}</strong>.
                            </CardDescription>
                        </div>
                    </CardContent>
                </Card>
            </InstructorPublicLayout>
        );
    }

    const editable =
        data?.application.status === "PENDING_SUBMISSION" ||
        data?.application.status === "PENDING_INFORMATION";

    return (
        <InstructorPublicLayout className="max-w-3xl">
            <div className="mb-8 space-y-3">
                <Badge variant="secondary" className="w-fit">
                    Đơn đăng ký Giảng viên
                </Badge>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Hoàn thiện hồ sơ giảng dạy
                    </h1>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="size-3.5"/>
                        {data?.application.email}
                    </p>
                </div>
                {data?.application.reviewReason && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                        Yêu cầu từ admin: {data.application.reviewReason}
                    </div>
                )}
            </div>

            {!editable ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <Clock3 className="size-7"/>
                        </div>
                        <div>
                            <CardTitle>Hồ sơ đã được gửi</CardTitle>
                            <CardDescription className="mt-1">
                                Trạng thái hiện tại:{" "}
                                <Badge variant="secondary">
                                    {STATUS_LABELS[data?.application.status ?? ""] ??
                                        data?.application.status}
                                </Badge>
                                . Bạn không cần thực hiện thêm thao tác.
                            </CardDescription>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle>Thông tin cá nhân</CardTitle>
                            <CardDescription>
                                Thông tin này sẽ hiển thị trên hồ sơ giảng viên của bạn.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="full-name">
                                    Họ và tên <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="full-name"
                                    required
                                    maxLength={255}
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="headline">Tiêu đề chuyên môn</Label>
                                <Input
                                    id="headline"
                                    maxLength={200}
                                    value={headline}
                                    onChange={(event) => setHeadline(event.target.value)}
                                    placeholder="Ví dụ: IELTS 8.0 - Chuyên luyện Speaking"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="bio">Giới thiệu bản thân</Label>
                                <Textarea
                                    id="bio"
                                    rows={4}
                                    value={bio}
                                    onChange={(event) => setBio(event.target.value)}
                                    placeholder="Kinh nghiệm giảng dạy, thế mạnh, phong cách dạy..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="website">Website / Portfolio</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={websiteUrl}
                                    onChange={(event) => setWebsiteUrl(event.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1">
                                    <CardTitle>Chứng chỉ & Bằng cấp</CardTitle>
                                    <CardDescription>
                                        Tải lên ít nhất một chứng chỉ (PDF/JPG/PNG/WEBP, tối đa
                                        5MB).
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCertificates((current) => [
                                            ...current,
                                            emptyCertificate(),
                                        ])
                                    }
                                >
                                    <Plus/>
                                    Thêm chứng chỉ
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {existingCertificates.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        Chứng chỉ đã tải ({existingCertificates.length})
                                    </p>
                                    <div className="space-y-2">
                                        {existingCertificates.map((certificate) => {
                                            const isRejected =
                                                certificate.status === "REJECTED";
                                            const isApproved =
                                                certificate.status === "APPROVED";
                                            return (
                                                <div
                                                    key={certificate.id}
                                                    className="space-y-2 rounded-md border bg-muted/40 px-3 py-2"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex min-w-0 items-center gap-2 text-sm">
                                                            <FileText className="size-4 shrink-0 text-muted-foreground"/>
                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium">
                                                                    {certificate.fileName || certificate.certificateName}
                                                                </p>
                                                                {certificate.issuer && (
                                                                    <p className="truncate text-xs text-muted-foreground">
                                                                        {certificate.issuer}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex shrink-0 items-center gap-2">
                                                            {isRejected ? (
                                                                <Badge variant="destructive">Bị từ chối</Badge>
                                                            ) : isApproved ? (
                                                                <Badge variant="default">Đã duyệt</Badge>
                                                            ) : (
                                                                <Badge variant="secondary">Chờ duyệt</Badge>
                                                            )}
                                                            {isRejected && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-destructive hover:text-destructive"
                                                                    disabled={deletingId === certificate.id}
                                                                    onClick={() =>
                                                                        handleDeleteExisting(certificate.id)
                                                                    }
                                                                >
                                                                    <Trash2/>
                                                                    {deletingId === certificate.id
                                                                        ? "Đang xóa..."
                                                                        : "Xóa"}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {isRejected && certificate.rejectReason && (
                                                        <p className="text-xs text-destructive">
                                                            Lý do: {certificate.rejectReason}
                                                        </p>
                                                    )}
                                                    {isApproved && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Chứng chỉ đã duyệt, không thể xóa.
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Chứng chỉ bị từ chối hãy xóa và tải lại bản đúng. Các
                                        chứng chỉ còn lại sẽ được giữ nguyên.
                                    </p>
                                </div>
                            )}

                            {certificates.map((certificate, index) => (
                                <div
                                    key={certificate.key}
                                    className="space-y-4 rounded-xl border p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <FileText className="size-4 text-muted-foreground"/>
                                            Chứng chỉ #{index + 1}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => removeCertificate(certificate.key)}
                                        >
                                            <Trash2/>
                                            Xóa
                                        </Button>
                                    </div>


                                    <div className="grid gap-2">
                                        <Label htmlFor={`certificate-file-${certificate.key}`}>
                                            File chứng chỉ <span className="text-destructive">*</span>
                                        </Label>
                                      {certificate.file ? (
                                          <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2">
                                            <div className="flex min-w-0 items-center gap-2 text-sm">
                                              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                              <span className="truncate">{certificate.file.name}</span>
                                            </div>
                                          </div>
                                      ) : (
                                          <Input
                                              id={`certificate-file-${certificate.key}`}
                                              type="file"
                                              multiple
                                              accept=".pdf,.jpg,.jpeg,.png,.webp"
                                              onChange={(event) => {
                                                handleFile(certificate.key, event.target.files);
                                                event.target.value = "";
                                              }}
                                          />
                                      )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {errorMessage && (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {errorMessage}
                        </div>
                    )}

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Spinner/>
                                Đang gửi hồ sơ...
                            </>
                        ) : (
                            "Gửi đơn đăng ký"
                        )}
                    </Button>
                </form>
            )}
        </InstructorPublicLayout>
    );
}
