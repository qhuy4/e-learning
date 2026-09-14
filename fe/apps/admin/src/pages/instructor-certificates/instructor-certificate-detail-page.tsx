import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInstructorCertificate, useApproveInstructorCertificate, useRejectInstructorCertificate } from "@/features/instructor-certificates/hooks/use-instructor-certificates";
import { instructorCertificateStatusLabel, instructorCertificateStatusClassName } from "@/features/instructor-certificates/types/instructor-certificate";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { ArrowLeft, Check, X } from "lucide-react";
import { toast } from "sonner";

export function InstructorCertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: certificate, isLoading } = useInstructorCertificate(Number(id));
  const approveMutation = useApproveInstructorCertificate();
  const rejectMutation = useRejectInstructorCertificate();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleApprove = () => {
    approveMutation.mutate(Number(id), {
      onSuccess: () => toast.success("Duyệt chứng chỉ thành công"),
      onError: () => toast.error("Không thể duyệt chứng chỉ"),
    });
  };

  const handleReject = () => {
    rejectMutation.mutate(
      { id: Number(id), rejectReason },
      {
        onSuccess: () => {
          toast.success("Từ chối chứng chỉ thành công");
          setShowRejectForm(false);
          setRejectReason("");
        },
        onError: () => toast.error("Không thể từ chối chứng chỉ"),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Không tìm thấy chứng chỉ.</p>
      </div>
    );
  }

  const status = certificate.certificateStatus as keyof typeof instructorCertificateStatusLabel;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate("/instructor-certificates")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{certificate.certificateName}</h1>
          <p className="text-sm text-muted-foreground mt-1">{certificate.issuer || "—"}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={instructorCertificateStatusClassName[status]}>
            {instructorCertificateStatusLabel[status]}
          </Badge>
          {certificate.certificateStatus === 1 && (
            <>
              <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                <Check className="h-4 w-4 mr-1" />
                {approveMutation.isPending ? "Đang duyệt..." : "Duyệt"}
              </Button>
              <Button variant="destructive" onClick={() => setShowRejectForm(true)}>
                <X className="h-4 w-4 mr-1" />
                Từ chối
              </Button>
            </>
          )}
        </div>
      </div>

      {showRejectForm && (
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <h2 className="font-semibold">Lý do từ chối</h2>
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            rows={3}
            placeholder="Lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? "Đang từ chối..." : "Xác nhận từ chối"}
            </Button>
            <Button variant="outline" onClick={() => setShowRejectForm(false)}>
              Hủy
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Thông tin chứng chỉ</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Giảng viên</p>
            <p className="font-medium">{certificate.user?.name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{certificate.user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tên chứng chỉ</p>
            <p className="font-medium">{certificate.certificateName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Viện cấp</p>
            <p className="font-medium">{certificate.issuer || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày phát hành</p>
            <p className="font-medium">{certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString("vi-VN") : "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày hết hạn</p>
            <p className="font-medium">{certificate.expiresAt ? new Date(certificate.expiresAt).toLocaleDateString("vi-VN") : "—"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">File</p>
            <a href={certificate.filePath} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Xem file
            </a>
          </div>
        </div>
      </div>

      {certificate.rejectReason && (
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">Lý do từ chối</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-muted-foreground">{certificate.rejectReason}</p>
          </div>
        </div>
      )}

      {certificate.reviewer && (
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">Thông tin duyệt</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Người duyệt</p>
              <p className="font-medium">{certificate.reviewer.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày duyệt</p>
              <p className="font-medium">{certificate.reviewedAt ? new Date(certificate.reviewedAt).toLocaleDateString("vi-VN") : "—"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
