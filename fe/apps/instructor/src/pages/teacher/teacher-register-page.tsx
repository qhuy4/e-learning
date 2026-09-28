import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Upload,
  X,
  User,
  CreditCard,
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileImage,
  Plus,
  Trash2,
} from "lucide-react";
import { useRegisterTeacher, useTeacherStatus } from "@/features/teacher/hooks/use-teacher";
import { getErrorMessage } from "@/shared/utils/error";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Card, CardContent } from "@fe/components/ui/card";
import { Badge } from "@fe/components/ui/badge";
import { Skeleton } from "@fe/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";

const STEPS = [
  { key: "profile", label: "Hồ sơ", icon: User },
  { key: "identity", label: "Xác minh CCCD", icon: CreditCard },
  { key: "certificates", label: "Chứng chỉ", icon: Award },
  { key: "review", label: "Xác nhận", icon: CheckCircle },
];

interface CertItem {
  certificateName: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  file: File | null;
}

function ImageUpload({
  label,
  file,
  preview,
  onChange,
  onRemove,
}: {
  label: string;
  file: File | null;
  preview: string | null;
  onChange: (f: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file tối đa 5MB.");
        return;
      }
      onChange(f);
    }
  };

  if (preview || file) {
    return (
      <div className="relative rounded-lg border overflow-hidden group">
        {preview && (
          <img src={preview} alt={label} className="w-full h-40 object-cover" />
        )}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="p-2 text-xs text-muted-foreground truncate">{file?.name}</div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="w-full h-40 rounded-lg border-2 border-dashed hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
    >
      <Upload className="h-6 w-6" />
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[10px]">JPG, PNG, WebP (tối đa 5MB)</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </button>
  );
}

export default function TeacherRegisterPage() {
  const { data: statusData, isLoading: statusLoading } = useTeacherStatus();
  const { mutateAsync: registerTeacher, isPending } = useRegisterTeacher();
  const [step, setStep] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Profile fields
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Identity fields
  const [identityNumber, setIdentityNumber] = useState("");
  const [identityFront, setIdentityFront] = useState<File | null>(null);
  const [identityFrontPreview, setIdentityFrontPreview] = useState<string | null>(null);
  const [identityBack, setIdentityBack] = useState<File | null>(null);
  const [identityBackPreview, setIdentityBackPreview] = useState<string | null>(null);
  const [selfieWithId, setSelfieWithId] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  // Certificates
  const [certs, setCerts] = useState<CertItem[]>([]);

  const status = statusData?.data;

  // Already registered
  if (statusLoading) {
    return (
      <div className="container mx-auto py-8 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (status && status.approvalStatus !== 3) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">Bạn đã nộp hồ sơ đăng ký giáo viên</h2>
            <p className="text-muted-foreground">
              Hồ sơ của bạn đang ở trạng thái:{" "}
              <Badge variant={status.approvalStatus === 2 ? "default" : "secondary"}>
                {status.approvalStatus === 2 ? "Đã duyệt" : "Đang chờ duyệt"}
              </Badge>
            </p>
            {status.kyc && (
              <p className="text-sm text-muted-foreground">
                eKYC: {status.kyc.ocrVerified ? "OCR ✓" : "OCR —"} |{" "}
                {status.kyc.faceVerified ? "Face ✓" : "Face —"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const setPreview = (setter: (v: string | null) => void) => (file: File) => {
    const url = URL.createObjectURL(file);
    setter(url);
  };

  const removePreview = (setter: (v: string | null) => void, fileSetter: (f: File | null) => void) => () => {
    setter(null);
    fileSetter(null);
  };

  const addCert = () => {
    setCerts([...certs, { certificateName: "", issuer: "", issuedAt: "", expiresAt: "", file: null }]);
  };

  const updateCert = (i: number, patch: Partial<CertItem>) => {
    setCerts(certs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };

  const removeCert = (i: number) => {
    setCerts(certs.filter((_, idx) => idx !== i));
  };

  const canNext = () => {
    if (step === 0) return true;
    if (step === 1) return identityNumber.trim() && identityFront && identityBack && selfieWithId;
    if (step === 2) return true;
    return true;
  };

  const handleSubmit = async () => {
    const tid = toast.loading("Đang gửi hồ sơ đăng ký...");
    try {
      const certsData = certs
        .filter((c) => c.certificateName.trim())
        .map((c) => ({
          certificateName: c.certificateName,
          issuer: c.issuer || undefined,
          issuedAt: c.issuedAt || undefined,
          expiresAt: c.expiresAt || undefined,
        }));

      const certFiles = certs
        .filter((c) => c.certificateName.trim() && c.file)
        .map((c) => c.file!);

      await registerTeacher(
        {
          data: {
            headline: headline || undefined,
            bio: bio || undefined,
            websiteUrl: websiteUrl || undefined,
            identityNumber,
            certificates: certsData.length > 0 ? certsData : undefined,
          },
          files: {
            identity_front: identityFront!,
            identity_back: identityBack!,
            selfie_with_id: selfieWithId!,
            certificate_files: certFiles.length > 0 ? certFiles : undefined,
          },
        },
        {
          onSuccess: () => {
            toast.success("Đã gửi hồ sơ thành công! Chờ admin phê duyệt.", { id: tid });
          },
          onError: (err) => {
            toast.error(getErrorMessage(err), { id: tid });
          },
        }
      );
    } catch {
      // handled by onError
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Đăng ký làm giáo viên</h1>
        <p className="text-muted-foreground mt-1">
          Hoàn tất hồ sơ để bắt đầu tạo khóa học trên nền tảng.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                i === step
                  ? "bg-primary/10 text-primary"
                  : i < step
                    ? "text-muted-foreground hover:bg-muted/50 cursor-pointer"
                    : "text-muted-foreground/50"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className="h-px bg-border flex-1 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {/* Step 0: Profile */}
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin hồ sơ
              </h3>
              <p className="text-sm text-muted-foreground">
                Thông tin hiển thị công khai trên hồ sơ giáo viên của bạn.
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="font-medium">Tiêu đề (Headline)</Label>
                  <Input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Ví dụ: Giảng viên IOL với 5 năm kinh nghiệm"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">{headline.length}/200</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Giới thiệu bản thân</Label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Chia sẻ kinh nghiệm giảng dạy, chuyên môn của bạn..."
                    className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Website cá nhân</Label>
                  <Input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Xác minh CCCD/CMND
              </h3>
              <p className="text-sm text-muted-foreground">
                tải lên ảnh CCCD/CMND và ảnh selfie để xác minh danh tính.
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="font-medium">Số CCCD/CMND *</Label>
                  <Input
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    placeholder="Nhập số CCCD/CMND"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Mặt trước *</Label>
                    <ImageUpload
                      label="Ảnh mặt trước"
                      file={identityFront}
                      preview={identityFrontPreview}
                      onChange={(f) => { setIdentityFront(f); setPreview(setIdentityFrontPreview)(f); }}
                      onRemove={removePreview(setIdentityFrontPreview, setIdentityFront)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Mặt sau *</Label>
                    <ImageUpload
                      label="Ảnh mặt sau"
                      file={identityBack}
                      preview={identityBackPreview}
                      onChange={(f) => { setIdentityBack(f); setPreview(setIdentityBackPreview)(f); }}
                      onRemove={removePreview(setIdentityBackPreview, setIdentityBack)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Selfie với CCCD *</Label>
                    <ImageUpload
                      label="Ảnh selfie"
                      file={selfieWithId}
                      preview={selfiePreview}
                      onChange={(f) => { setSelfieWithId(f); setPreview(setSelfiePreview)(f); }}
                      onRemove={removePreview(setSelfiePreview, setSelfieWithId)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Certificates */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5" />
                Chứng chỉ (tùy chọn)
              </h3>
              <p className="text-sm text-muted-foreground">
                Thêm chứng chỉ giảng dạy để tăng uy tín. Bạn có thể bỏ qua bước này.
              </p>
              {certs.map((cert, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeCert(i)}
                    className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Tên chứng chỉ *</Label>
                      <Input
                        value={cert.certificateName}
                        onChange={(e) => updateCert(i, { certificateName: e.target.value })}
                        placeholder="Ví dụ: TESOL"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Tổ chức cấp</Label>
                      <Input
                        value={cert.issuer}
                        onChange={(e) => updateCert(i, { issuer: e.target.value })}
                        placeholder="Ví dụ: TESOL Academy"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Ngày cấp</Label>
                      <Input
                        type="date"
                        value={cert.issuedAt}
                        onChange={(e) => updateCert(i, { issuedAt: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Ngày hết hạn</Label>
                      <Input
                        type="date"
                        value={cert.expiresAt}
                        onChange={(e) => updateCert(i, { expiresAt: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Ảnh chứng chỉ</Label>
                    {cert.file ? (
                      <div className="flex items-center gap-2 p-2 rounded border">
                        <FileImage className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs flex-1 truncate">{cert.file.name}</span>
                        <button
                          type="button"
                          onClick={() => updateCert(i, { file: null })}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 p-2 rounded border border-dashed cursor-pointer hover:bg-muted/50 text-xs text-muted-foreground">
                        <Upload className="h-4 w-4" />
                        Chọn ảnh
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f && f.size <= 5 * 1024 * 1024) {
                              updateCert(i, { file: f });
                            } else if (f) {
                              toast.error("File tối đa 5MB.");
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addCert}>
                <Plus className="h-4 w-4 mr-1.5" />
                Thêm chứng chỉ
              </Button>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Xác nhận hồ sơ
              </h3>
              <div className="space-y-3 text-sm">
                {headline && (
                  <div>
                    <span className="text-muted-foreground">Tiêu đề: </span>
                    <span className="font-medium">{headline}</span>
                  </div>
                )}
                {bio && (
                  <div>
                    <span className="text-muted-foreground">Giới thiệu: </span>
                    <span className="font-medium line-clamp-2">{bio}</span>
                  </div>
                )}
                {websiteUrl && (
                  <div>
                    <span className="text-muted-foreground">Website: </span>
                    <span className="font-medium">{websiteUrl}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Số CCCD: </span>
                  <span className="font-medium">{identityNumber}</span>
                </div>
                <div className="flex gap-4">
                  {identityFront && (
                    <div className="text-center">
                      <img src={identityFrontPreview!} alt="Front" className="h-20 rounded border" />
                      <p className="text-[10px] text-muted-foreground mt-1">Mặt trước</p>
                    </div>
                  )}
                  {identityBack && (
                    <div className="text-center">
                      <img src={identityBackPreview!} alt="Back" className="h-20 rounded border" />
                      <p className="text-[10px] text-muted-foreground mt-1">Mặt sau</p>
                    </div>
                  )}
                  {selfieWithId && (
                    <div className="text-center">
                      <img src={selfiePreview!} alt="Selfie" className="h-20 rounded border" />
                      <p className="text-[10px] text-muted-foreground mt-1">Selfie</p>
                    </div>
                  )}
                </div>
                {certs.filter((c) => c.certificateName).length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Chứng chỉ: </span>
                    <span className="font-medium">
                      {certs.filter((c) => c.certificateName).map((c) => c.certificateName).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          Quay lại
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0"
          >
            Tiếp
            <ChevronRight className="h-4 w-4 ml-1.5" />
          </Button>
        ) : (
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={isPending}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0"
          >
            {isPending ? "Đang gửi..." : "Gửi hồ sơ"}
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Gửi hồ sơ đăng ký"
        description="Hồ sơ sẽ được gửi cho admin phê duyệt. Bạn không thể chỉnh sửa sau khi gửi."
        confirmLabel="Gửi hồ sơ"
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
