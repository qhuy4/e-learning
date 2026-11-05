import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {ArrowLeft, CalendarDays, ExternalLink, Mail, RefreshCw,} from "lucide-react";
import {toast} from "sonner";
import {adminInstructorService} from "@/features/instructors/service";
import type {
  InstructorApplicationStatus,
  InstructorApplicationCertificate,
  PendingInstructorProfile,
  ReviewedCertificateOcrInput,
} from "@/features/instructors/type/pending-instructor.ts";
import {Badge} from "@fe/components/ui/badge";
import {Button} from "@fe/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@fe/components/ui/card";
import {Separator} from "@fe/components/ui/separator";
import {Textarea} from "@fe/components/ui/textarea";
import {Input} from "@fe/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";

const CERTIFICATE_TAGS = [
  "IELTS",
  "TOEIC",
  "TOEFL",
  "TESOL",
  "CELTA",
  "DELTA",
  "BUSINESS_ENGLISH",
  "GENERAL_ENGLISH",
  "KIDS",
  "PRONUNCIATION",
  "WRITING",
  "SPEAKING",
];

const STATUS_META: Record<
  InstructorApplicationStatus,
  { label: string; variant: "outline" | "secondary" | "default" | "destructive" }
> = {
  PENDING_SUBMISSION: { label: "Chờ bổ sung", variant: "secondary" },
  PENDING_INFORMATION: { label: "Cần bổ sung", variant: "secondary" },
  PENDING_REVIEW: { label: "Chờ duyệt", variant: "outline" },
  APPROVED: { label: "Đã duyệt", variant: "default" },
  REJECTED: { label: "Đã từ chối", variant: "destructive" },
};

type ReviewAction = "approve" | "reject" | "information" | null;

type CertificateDraft = {
  documentType: DocTypeKey;
  candidateName: string;
  credentialNumber: string;
  testDate: string;
  issuer: string;
  overall: string;
  listening: string;
  reading: string;
  writing: string;
  speaking: string;
};

function certificateToDraft(
  certificate: InstructorApplicationCertificate,
): CertificateDraft {
  const ocr = certificate.ocrExtractedData;
  const value = (score: number | null | undefined) =>
    score == null ? "" : String(score);
  return {
    documentType: ocr?.document_type ?? "UNKNOWN",
    candidateName: ocr?.candidate_name?.value ?? "",
    credentialNumber: ocr?.test_report_form_number?.value ?? "",
    testDate: ocr?.test_date?.value ?? "",
    issuer: ocr?.issuing_organization?.value ?? certificate.issuer ?? "",
    overall: value(ocr?.scores.overall),
    listening: value(ocr?.scores.listening),
    reading: value(ocr?.scores.reading),
    writing: value(ocr?.scores.writing),
    speaking: value(ocr?.scores.speaking),
  };
}

function reviewedOcrInput(
  draft: CertificateDraft | undefined,
): ReviewedCertificateOcrInput | string {
  if (!draft || draft.documentType === "UNKNOWN") {
    return "Vui lòng chọn loại chứng chỉ IELTS hoặc TOEIC.";
  }
  const required =
    draft.documentType === "IELTS_TRF"
      ? ["overall", "listening", "reading", "writing", "speaking"] as const
      : ["overall", "listening", "reading"] as const;
  if (required.some((key) => draft[key].trim() === "")) {
    return draft.documentType === "IELTS_TRF"
      ? "IELTS cần đủ Overall, Listening, Reading, Writing và Speaking."
      : "TOEIC cần đủ điểm tổng, Listening và Reading.";
  }
  const number = (value: string) =>
    value.trim() === "" ? undefined : Number(value);
  const values = Object.fromEntries(
    (["overall", "listening", "reading", "writing", "speaking"] as const)
      .map((key) => [key, number(draft[key])]),
  ) as Pick<ReviewedCertificateOcrInput, "overall" | "listening" | "reading" | "writing" | "speaking">;
  if (Object.values(values).some((value) => value != null && !Number.isFinite(value))) {
    return "Điểm chứng chỉ phải là số hợp lệ.";
  }
  return {
    documentType: draft.documentType,
    candidateName: draft.candidateName.trim() || undefined,
    credentialNumber: draft.credentialNumber.trim() || undefined,
    testDate: draft.testDate || undefined,
    issuer: draft.issuer.trim() || undefined,
    ...values,
  };
}

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

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("vi-VN");
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium break-words">{value}</div>
    </div>
  );
}

function OcrField({ label, value }: { label: string; value?: string | null }) {
  if (!value) {
    return (
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-muted-foreground/50">—</span>
      </div>
    );
  }
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium break-words">{value}</span>
    </div>
  );
}

type DocTypeKey = "IELTS_TRF" | "TOEIC" | "UNKNOWN";

const DOC_TYPE_LABELS: Record<DocTypeKey, string> = {
  IELTS_TRF: "IELTS TRF",
  TOEIC: "TOEIC",
  UNKNOWN: "Không rõ loại",
};

const OCR_WARNING_LABELS: Record<string, string> = {
  NOT_IELTS_TRF: "Không nhận diện được loại chứng chỉ",
  MISSING_CANDIDATE_NAME: "Không trích xuất được tên thí sinh",
  MISSING_TRF_NUMBER: "Không trích xuất được số TRF",
  MISSING_TEST_DATE: "Không trích xuất được ngày thi",
  INVALID_DATE: "Ngày thi nằm trong tương lai — vui lòng đối soát dữ liệu test",
  MISSING_OVERALL: "Không trích xuất được điểm tổng thể",
  MISSING_COMPONENT_SCORES:
    "Không trích xuất được điểm thành phần (L/R/W/S)",
  INCOMPLETE_COMPONENT_SCORES:
    "Thiếu một số điểm thành phần (L/R/W/S)",
  OVERALL_INCONSISTENT:
    "Điểm tổng thể không khớp trung bình cộng 4 kỹ năng",
};

export function InstructorApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const applicationId = Number(id);
  const validId = Number.isFinite(applicationId);

  const [application, setApplication] =
    useState<PendingInstructorProfile | null>(null);
  const [certificateTags, setCertificateTags] = useState<
    Record<string, string[]>
  >({});
  const [certificateDrafts, setCertificateDrafts] = useState<
    Record<string, CertificateDraft>
  >({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(validId);
  const [error, setError] = useState<string | null>(
    validId ? null : "Mã hồ sơ không hợp lệ.",
  );
  const [action, setAction] = useState<ReviewAction>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const syncApplication = (detail: PendingInstructorProfile) => {
    setApplication(detail);
    setCertificateTags(
      Object.fromEntries(
        (detail.certificates ?? []).map((certificate) => [
          String(certificate.id),
          certificate.tags ?? [],
        ]),
      ),
    );
    setCertificateDrafts(
      Object.fromEntries(
        (detail.certificates ?? []).map((certificate) => [
          String(certificate.id),
          certificateToDraft(certificate),
        ]),
      ),
    );
  };

  useEffect(() => {
    let cancelled = false;

    if (!validId) return;

    adminInstructorService
      .getApplication(applicationId)
      .then((detail) => {
        if (cancelled) return;
        syncApplication(detail);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(getErrorMessage(err, "Không thể tải chi tiết hồ sơ."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applicationId, validId]);

  const reload = async () => {
    setLoading(true);
    try {
      const detail = await adminInstructorService.getApplication(applicationId);
      syncApplication(detail);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không thể tải chi tiết hồ sơ."));
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (certificateId: number, tag: string) => {
    setCertificateTags((current) => {
      const key = String(certificateId);
      const existing = current[key] ?? [];
      return {
        ...current,
        [key]: existing.includes(tag)
          ? existing.filter((item) => item !== tag)
          : [...existing, tag],
      };
    });
  };

  const setCertificateField = <K extends keyof CertificateDraft>(
    certificateId: number,
    field: K,
    value: CertificateDraft[K],
  ) => {
    setCertificateDrafts((current) => ({
      ...current,
      [String(certificateId)]: {
        ...current[String(certificateId)],
        [field]: value,
      },
    }));
  };

  const handleReviewCertificate = async (
    certificateId: number,
    status: "APPROVED" | "REJECTED",
  ) => {
    if (!application) return;

    const ocrData =
      status === "APPROVED"
        ? reviewedOcrInput(certificateDrafts[String(certificateId)])
        : undefined;
    if (typeof ocrData === "string") {
      toast.error(ocrData);
      return;
    }

    const tid = toast.loading(
      status === "APPROVED"
        ? "Đang duyệt chứng chỉ..."
        : "Đang từ chối chứng chỉ...",
    );
    setSubmitting(true);
    try {
      const result = await adminInstructorService.reviewCertificate(
        application.id,
        certificateId,
        status,
        reason.trim() || undefined,
        ocrData,
      );
      await reload();
      setReason("");
      setAction(null);
      toast.success(result?.message ?? "Đã cập nhật chứng chỉ.", { id: tid });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Không thể cập nhật chứng chỉ."), {
        id: tid,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!application) return;
    if (application.certificates.some((certificate) => certificate.status === "PENDING")) {
      toast.error("Vui lòng kiểm tra và duyệt hoặc từ chối từng chứng chỉ trước.");
      return;
    }

    const tid = toast.loading("Đang duyệt hồ sơ...");
    setSubmitting(true);
    try {
      const result = await adminInstructorService.approveApplication(
        application.id,
        certificateTags,
      );
      toast.success(
        result?.requiresActivation
          ? "Đã duyệt hồ sơ và gửi liên kết kích hoạt."
          : "Đã duyệt hồ sơ giảng viên.",
        { id: tid },
      );
      navigate("/instructors/applications");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Lỗi khi duyệt hồ sơ."), { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    const tid = toast.loading("Đang xử lý từ chối...");
    setSubmitting(true);
    try {
      await adminInstructorService.rejectApplication(
        application.id,
        reason.trim(),
      );
      toast.success("Đã từ chối hồ sơ.", { id: tid });
      navigate("/instructors/applications");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Lỗi khi từ chối hồ sơ."), { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestInformation = async () => {
    if (!application) return;
    if (!reason.trim()) {
      toast.error("Vui lòng nhập nội dung cần bổ sung.");
      return;
    }

    const tid = toast.loading("Đang gửi yêu cầu bổ sung...");
    setSubmitting(true);
    try {
      await adminInstructorService.requestInformation(
        application.id,
        reason.trim(),
      );
      toast.success("Đã gửi yêu cầu bổ sung thông tin.", { id: tid });
      navigate("/instructors/applications");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Lỗi khi gửi yêu cầu bổ sung."), {
        id: tid,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (certificateId: number) => {
    const popup = window.open("", "_blank");
    try {
      const result =
        await adminInstructorService.getCertificateDownloadUrl(certificateId);
      if (popup && result?.url) {
        popup.location.href = result.url;
      } else if (result?.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      }
    } catch (err: unknown) {
      popup?.close();
      toast.error(getErrorMessage(err, "Không thể mở chứng chỉ."));
    }
  };

  const handlePreview = async (certificateId: number) => {
    const key = String(certificateId);
    if (previewUrls[key]) {
      setPreviewUrls((current) => {
        const next = {...current};
        delete next[key];
        return next;
      });
      return;
    }
    try {
      const result =
        await adminInstructorService.getCertificateDownloadUrl(certificateId);
      if (result?.url) {
        setPreviewUrls((current) => ({...current, [key]: result.url}));
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Không thể xem chứng chỉ."));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-6"
          onClick={() => navigate("/instructors/approvals")}
        >
          <ArrowLeft className="size-4" />
          Quay lại danh sách
        </Button>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h2 className="text-lg font-semibold">Không tìm thấy hồ sơ</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {error || "Hồ sơ không tồn tại hoặc đã bị xóa."}
          </p>
          <Button className="mt-6" onClick={reload}>
            Tải lại
          </Button>
        </div>
      </div>
    );
  }

  const status = STATUS_META[application.status];
  const canReview = application.status === "PENDING_REVIEW";
  // Chốt từng chứng chỉ được phép khi hồ sơ chưa kết thúc, kể cả khi vừa
  // từ chối 1 chứng chỉ làm hồ sơ chuyển sang PENDING_INFORMATION.
  const canReviewCertificates =
    application.status === "PENDING_REVIEW" ||
    application.status === "PENDING_INFORMATION" ||
    application.status === "PENDING_SUBMISSION";

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4"
        onClick={() => navigate("/instructors/approvals")}
      >
        <ArrowLeft className="size-4" />
        Quay lại danh sách
      </Button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">Hồ sơ đăng ký giảng viên</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Mã hồ sơ #{application.id}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reload}>
          <RefreshCw className="size-4" />
          Tải lại
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Thông tin ứng viên</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Họ tên" value={application.fullName || "Chưa cập nhật"} />
              <Field
                label="Email"
                value={
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-3.5" />
                    {application.email}
                  </span>
                }
              />
              <Field
                label="Tiêu đề chuyên môn"
                value={application.headline || "Không có"}
              />
              <Field
                label="Website / Portfolio"
                value={
                  application.websiteUrl ? (
                    <a
                      href={application.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      {application.websiteUrl}
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    "Không có"
                  )
                }
              />
              <Field
                label="Ngày nộp"
                value={
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {formatDate(application.submittedAt || application.createdAt)}
                  </span>
                }
              />
              <div className="sm:col-span-2">
                <Field
                  label="Tiểu sử"
                  value={application.bio || "Không có"}
                />
              </div>
              {application.reviewReason && (
                <div className="sm:col-span-2">
                  <Separator className="mb-4" />
                  <Field
                    label="Phản hồi gần nhất"
                    value={
                      <span className="text-amber-700 dark:text-amber-300">
                        {application.reviewReason}
                      </span>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>
                Chứng chỉ & Bằng cấp ({application.certificates?.length ?? 0})
              </CardTitle>
              <CardDescription>
                {canReview
                  ? "Chỉnh nhãn chứng chỉ trước khi duyệt hồ sơ."
                  : "Nhãn chứng chỉ đã được lưu."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(application.certificates?.length ?? 0) === 0 ? (
                <p className="text-sm italic text-muted-foreground">
                  Không nộp chứng chỉ kèm theo.
                </p>
              ) : (
                <div className="space-y-4">
                  {application.certificates.map((certificate) => {
                    const docType =
                      certificate.ocrExtractedData?.document_type ?? null;
                    const isToeic = docType === "TOEIC";
                    const draft = certificateDrafts[String(certificate.id)];
                    const canEditCertificate =
                      canReviewCertificates && certificate.status !== "APPROVED";
                    const scoreTitle = isToeic
                      ? "Điểm TOEIC (10–990)"
                      : "Điểm IELTS (0–9)";
                    const scoreColumns = (
                      isToeic
                        ? (
                            [
                              ["listening", "Listening"],
                              ["reading", "Reading"],
                              ["overall", "Tổng"],
                            ] as const
                          )
                        : ([
                            ["listening", "Listening"],
                            ["reading", "Reading"],
                            ["writing", "Writing"],
                            ["speaking", "Speaking"],
                            ["overall", "Tổng"],
                          ] as const)
                    );
                    return (
                    <div
                      key={certificate.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">
                              {certificate.certificateName}
                            </p>
                            <Badge
                              variant={
                                certificate.ocrStatus === "completed"
                                  ? "default"
                                  : certificate.ocrStatus === "failed"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {certificate.ocrStatus === "completed"
                                ? "Đã OCR"
                                : certificate.ocrStatus === "failed"
                                  ? "OCR thất bại"
                                  : "Chưa OCR"}
                            </Badge>
                            <Badge
                              variant={
                                certificate.status === "APPROVED"
                                  ? "default"
                                  : certificate.status === "REJECTED"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {certificate.status === "APPROVED"
                                ? "Quản trị viên đã duyệt"
                                : certificate.status === "REJECTED"
                                  ? "Bị từ chối"
                                  : "Chờ duyệt"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Đơn vị cấp: {certificate.issuer || "Không ghi"} |
                            Ngày cấp: {formatDate(certificate.issuedAt)}
                          </p>
                          {certificate.status === "REJECTED" &&
                            certificate.rejectReason && (
                              <p className="mt-1 text-xs text-destructive">
                                Lý do từ chối: {certificate.rejectReason}
                              </p>
                            )}
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(certificate.id)}
                          >
                            Mở file
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(certificate.id)}
                          >
                            {previewUrls[String(certificate.id)] ? "Ẩn bản gốc" : "Xem tại đây"}
                          </Button>
                          {canReviewCertificates && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                  submitting ||
                                  certificate.status === "APPROVED"
                                }
                                onClick={() =>
                                  handleReviewCertificate(
                                    certificate.id,
                                    "APPROVED",
                                  )
                                }
                              >
                                Duyệt
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                disabled={
                                  submitting ||
                                  certificate.status === "REJECTED"
                                }
                                onClick={() =>
                                  handleReviewCertificate(
                                    certificate.id,
                                    "REJECTED",
                                  )
                                }
                              >
                                Từ chối
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {(previewUrls[String(certificate.id)] || canEditCertificate) && (
                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          <div className="min-h-72 overflow-hidden rounded-md border bg-muted/20">
                            {previewUrls[String(certificate.id)] ? (
                              certificate.mimeType?.startsWith("image/") ? (
                                <img
                                  src={previewUrls[String(certificate.id)]}
                                  alt={`Chứng chỉ ${certificate.certificateName}`}
                                  className="h-full max-h-[560px] w-full object-contain"
                                />
                              ) : (
                                <iframe
                                  src={previewUrls[String(certificate.id)]}
                                  title={`Chứng chỉ ${certificate.certificateName}`}
                                  className="h-[560px] w-full"
                                />
                              )
                            ) : (
                              <div className="flex h-full min-h-72 flex-col items-center justify-center gap-2 p-6 text-center">
                                <p className="text-sm font-medium">File chứng chỉ gốc</p>
                                <p className="text-xs text-muted-foreground">
                                  Mở bản xem trước để đối chiếu với dữ liệu OCR.
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePreview(certificate.id)}
                                >
                                  Xem bản gốc
                                </Button>
                              </div>
                            )}
                          </div>

                          {canEditCertificate && draft && (
                            <div className="space-y-4 rounded-md border p-4">
                              <div>
                                <p className="text-sm font-semibold">Dữ liệu admin xác nhận</p>
                                <p className="text-xs text-muted-foreground">
                                  Kiểm tra và sửa theo file gốc trước khi duyệt.
                                </p>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium">Loại chứng chỉ</label>
                                <Select
                                  value={draft.documentType}
                                  onValueChange={(value) =>
                                    setCertificateField(
                                      certificate.id,
                                      "documentType",
                                      value as DocTypeKey,
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="UNKNOWN">Chọn loại chứng chỉ</SelectItem>
                                    <SelectItem value="IELTS_TRF">IELTS</SelectItem>
                                    <SelectItem value="TOEIC">TOEIC</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium">Tên thí sinh</label>
                                  <Input
                                    value={draft.candidateName}
                                    onChange={(event) =>
                                      setCertificateField(certificate.id, "candidateName", event.target.value)
                                    }
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium">
                                    {draft.documentType === "TOEIC" ? "Số chứng chỉ" : "Số TRF"}
                                  </label>
                                  <Input
                                    value={draft.credentialNumber}
                                    onChange={(event) =>
                                      setCertificateField(certificate.id, "credentialNumber", event.target.value)
                                    }
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium">Ngày thi</label>
                                  <Input
                                    type="date"
                                    value={draft.testDate}
                                    onChange={(event) =>
                                      setCertificateField(certificate.id, "testDate", event.target.value)
                                    }
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium">Đơn vị cấp</label>
                                  <Input
                                    value={draft.issuer}
                                    onChange={(event) =>
                                      setCertificateField(certificate.id, "issuer", event.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <div>
                                <p className="mb-2 text-xs font-medium">Điểm chứng chỉ</p>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                  {(["overall", "listening", "reading"] as const).map((key) => (
                                    <div key={key} className="space-y-1">
                                      <label className="text-[11px] capitalize text-muted-foreground">{key}</label>
                                      <Input
                                        type="number"
                                        step={draft.documentType === "IELTS_TRF" ? "0.5" : "1"}
                                        value={draft[key]}
                                        onChange={(event) =>
                                          setCertificateField(certificate.id, key, event.target.value)
                                        }
                                      />
                                    </div>
                                  ))}
                                  {draft.documentType !== "TOEIC" &&
                                    (["writing", "speaking"] as const).map((key) => (
                                      <div key={key} className="space-y-1">
                                        <label className="text-[11px] capitalize text-muted-foreground">{key}</label>
                                        <Input
                                          type="number"
                                          step="0.5"
                                          value={draft[key]}
                                          onChange={(event) =>
                                            setCertificateField(certificate.id, key, event.target.value)
                                          }
                                        />
                                      </div>
                                    ))}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Ngày thi tương lai chỉ hiển thị cảnh báo trong dữ liệu test; không tự động thay bằng ngày tải lên.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {!canEditCertificate && certificate.ocrStatus === "completed" &&
                        certificate.ocrExtractedData && (
                          <div className="mt-3 space-y-3">
                            <div className="rounded-md border p-3">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-semibold">
                                  Thông tin chứng chỉ
                                </p>
                                <Badge variant="outline">
                                  {DOC_TYPE_LABELS[
                                    certificate.ocrExtractedData
                                      .document_type as DocTypeKey
                                  ] ?? "Không rõ loại"}
                                </Badge>
                              </div>
                              <div className="grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
                                <OcrField
                                  label="Tên thí sinh"
                                  value={
                                    certificate.ocrExtractedData.candidate_name
                                      ?.value
                                  }
                                />
                                {certificate.ocrExtractedData.document_type ===
                                  "IELTS_TRF" && (
                                  <OcrField
                                    label="Số TRF"
                                    value={
                                      certificate.ocrExtractedData
                                        .test_report_form_number?.value
                                    }
                                  />
                                )}
                                <OcrField
                                  label="Ngày thi"
                                  value={
                                    certificate.ocrExtractedData.test_date
                                      ?.value
                                  }
                                />
                                <OcrField
                                  label="Ngày sinh"
                                  value={
                                    certificate.ocrExtractedData.date_of_birth
                                      ?.value
                                  }
                                />
                                <OcrField
                                  label="Loại bài thi"
                                  value={
                                    certificate.ocrExtractedData.test_type
                                      ?.value
                                  }
                                />
                                <OcrField
                                  label="Đơn vị cấp"
                                  value={
                                    certificate.ocrExtractedData
                                      .issuing_organization?.value ??
                                    certificate.issuer
                                  }
                                />
                              </div>
                            </div>

                            <div className="rounded-md border  p-3 border-blue-800 ">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                                  {scoreTitle}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  {certificate.ocrExtractedData.cefr_level && (
                                    <Badge
                                      variant="outline"
                                      className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                                    >
                                      CEFR {certificate.ocrExtractedData.cefr_level}
                                    </Badge>
                                  )}
                                  <Badge variant="secondary">
                                    Chưa xác minh bởi đơn vị cấp
                                  </Badge>
                                </div>
                              </div>
                              <div
                                className={`grid grid-cols-2 gap-2 ${
                                  isToeic ? "sm:grid-cols-3" : "sm:grid-cols-5"
                                }`}
                              >
                                {scoreColumns.map(([key, label]) => {
                                  const value =
                                    certificate.ocrExtractedData?.scores[key];
                                  return (
                                    <div
                                      key={key}
                                      className="rounded bg-white p-2 text-center dark:bg-gray-900"
                                    >
                                      <p className="text-[11px] text-muted-foreground">
                                        {label}
                                      </p>
                                      <p
                                        className={`text-lg font-bold ${
                                          value != null
                                            ? key === "overall"
                                              ? "text-blue-700 dark:text-blue-300"
                                              : "text-foreground"
                                            : "text-muted-foreground/50"
                                        }`}
                                      >
                                        {value != null ? value : "—"}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {certificate.ocrExtractedData.extraction_warnings
                              .length > 0 && (
                              <div className="rounded-md border border-amber-300  p-3 dark:border-amber-700 ">
                                <p className="mb-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
                                  Cảnh báo trích xuất
                                </p>
                                <ul className="list-inside list-disc space-y-0.5 text-xs text-amber-700 dark:text-amber-300">
                                  {certificate.ocrExtractedData.extraction_warnings.map(
                                    (warning) => (
                                      <li key={warning}>
                                        {OCR_WARNING_LABELS[warning] ?? warning}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}

                            {certificate.ocrRawText && (
                              <details className="rounded-md border bg-muted/30">
                                <summary className="cursor-pointer px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
                                  Văn bản OCR gốc
                                </summary>
                                <div className="border-t px-3 py-2">
                                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-muted-foreground">
                                    {certificate.ocrRawText}
                                  </pre>
                                </div>
                              </details>
                            )}
                          </div>
                        )}

                      {certificate.ocrStatus === "completed" &&
                        !certificate.ocrExtractedData && (
                          <p className="mt-3 text-xs text-muted-foreground">
                            OCR đã hoàn tất nhưng không trích xuất được dữ liệu
                            có cấu trúc.
                          </p>
                        )}

                      {certificate.ocrStatus === "failed" && (
                        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                          OCR không đọc được nội dung chứng chỉ. Vui lòng xem
                          file gốc và nhập thông tin thủ công.
                        </p>
                      )}

                      <div className="mt-4">
                        <p className="mb-2 text-xs text-muted-foreground">
                          Nhãn chứng chỉ
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {CERTIFICATE_TAGS.map((tag) => {
                            const selected = (
                              certificateTags[String(certificate.id)] ?? []
                            ).includes(tag);

                            if (!canReview) {
                              return selected ? (
                                <Badge key={tag} variant="secondary">
                                  {tag.replaceAll("_", " ")}
                                </Badge>
                              ) : null;
                            }

                            return (
                              <Button
                                key={tag}
                                type="button"
                                size="xs"
                                variant={selected ? "default" : "outline"}
                                className="rounded-full"
                                onClick={() => toggleTag(certificate.id, tag)}
                              >
                                {tag.replaceAll("_", " ")}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="lg:sticky lg:top-20">
            <CardHeader className="border-b">
              <CardTitle>Xét duyệt hồ sơ</CardTitle>
              <CardDescription>
                {canReview
                  ? "Duyệt, yêu cầu bổ sung hoặc từ chối hồ sơ này. Với từng chứng chỉ, dùng nút Duyệt / Từ chối ở khung chứng chỉ: chứng chỉ bị từ chối sẽ hiện ở trang nộp hồ sơ để học viên xóa và tải lại."
                  : "Hồ sơ đã được xử lý."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {canReview && action === null && (
                <>
                  <Button
                    className="w-full"
                    disabled={submitting}
                    onClick={() => setAction("approve")}
                  >
                    Duyệt hồ sơ
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={submitting}
                    onClick={() => {
                      setReason("");
                      setAction("information");
                    }}
                  >
                    Yêu cầu bổ sung
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={submitting}
                    onClick={() => {
                      setReason("");
                      setAction("reject");
                    }}
                  >
                    Từ chối
                  </Button>
                </>
              )}

              {canReview && action === "approve" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Xác nhận duyệt hồ sơ? Hệ thống sẽ tạo hoặc kích hoạt tài
                    khoản giảng viên và gửi email hướng dẫn.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={submitting}
                      onClick={() => setAction(null)}
                    >
                      Hủy
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={submitting}
                      onClick={handleApprove}
                    >
                      {submitting ? "Đang duyệt..." : "Xác nhận"}
                    </Button>
                  </div>
                </div>
              )}

              {canReview && action === "reject" && (
                <div className="space-y-3">
                  <Textarea
                    rows={4}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Nhập lý do từ chối gửi tới ứng viên..."
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={submitting}
                      onClick={() => setAction(null)}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={submitting || !reason.trim()}
                      onClick={handleReject}
                    >
                      {submitting ? "Đang xử lý..." : "Từ chối"}
                    </Button>
                  </div>
                </div>
              )}

              {canReview && action === "information" && (
                <div className="space-y-3">
                  <Textarea
                    rows={4}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Nhập nội dung cần bổ sung..."
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={submitting}
                      onClick={() => setAction(null)}
                    >
                      Hủy
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={submitting || !reason.trim()}
                      onClick={handleRequestInformation}
                    >
                      {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
                    </Button>
                  </div>
                </div>
              )}

              {!canReview && (
                <p className="text-sm text-muted-foreground">
                  Hồ sơ ở trạng thái {status.label.toLowerCase()} nên không thể
                  xét duyệt lại.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
