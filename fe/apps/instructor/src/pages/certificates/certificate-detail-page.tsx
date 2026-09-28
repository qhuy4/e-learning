import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  ChevronLeft,
  FileText,
  Calendar,
  Building2,
  ExternalLink,
  Trash2,
  Clock,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { useCertificateById, useDeleteCertificate } from "@/features/certificates/hook/use-certificates";
import { CERTIFICATE_STATUS } from "@/features/certificates/types/certificate";
import { getErrorMessage } from "@/shared/utils/error";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Separator } from "@fe/components/ui/separator";
import { Skeleton } from "@fe/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

const STATUS_ICONS: Record<number, typeof Clock> = {
  1: Clock,
  2: CheckCircle2,
  3: Ban,
};

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useCertificateById(Number(id));
  const deleteMutation = useDeleteCertificate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const cert = data?.data;

  const confirmDelete = () => {
    const tid = toast.loading("Đang xóa...");
    deleteMutation.mutate(Number(id), {
      onSuccess: () => {
        toast.success("Đã xóa chứng chỉ.", { id: tid });
        navigate("/certificates");
      },
      onError: (err) => toast.error(getErrorMessage(err), { id: tid }),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6  mx-auto p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="space-y-6  mx-auto p-6">
        <p className="text-muted-foreground">Chứng chỉ không tồn tại.</p>
        <Button variant="outline" onClick={() => navigate("/certificates")}>
          Quay lại
        </Button>
      </div>
    );
  }

  const status =
    CERTIFICATE_STATUS[cert.certificateStatus as keyof typeof CERTIFICATE_STATUS];
  const StatusIcon = STATUS_ICONS[cert.certificateStatus] || Clock;

  return (
    <div className="space-y-6  mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/certificates")}
          className="rounded-md hover:bg-muted shrink-0 h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight">{cert.certificateName}</h1>
            <Badge variant={status?.variant} className={`${status?.className} border-0`}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {status?.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chi tiết chứng chỉ của bạn
          </p>
        </div>
        {cert.certificateStatus === 1 && (
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="px-5">
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin chứng chỉ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nhà cung cấp</label>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{cert.issuer || "—"}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ngày cấp</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(cert.issuedAt)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Hết hạn</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(cert.expiresAt)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(cert.createdAt)}</span>
                </div>
              </div>
            </div>

            {cert.rejectReason && (
              <>
                <Separator />
                <div className="rounded-lg bg-red-50 p-4">
                  <label className="text-sm font-medium text-red-800">Lý do từ chối</label>
                  <p className="text-sm text-red-700 mt-1">{cert.rejectReason}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File chứng chỉ</CardTitle>
          </CardHeader>
          <CardContent>
            {cert.filePath ? (
              <a
                href={cert.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
              >
                <FileText className="h-10 w-10 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium block truncate">Xem file chứng chỉ</span>
                  <span className="text-xs text-muted-foreground">Mở trong tab mới</span>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có file</p>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Xóa chứng chỉ?"
        description="Bạn có chắc chắn muốn xóa chứng chỉ này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
