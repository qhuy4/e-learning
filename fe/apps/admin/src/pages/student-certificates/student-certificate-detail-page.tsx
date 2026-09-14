import { useParams, useNavigate } from "react-router-dom";
import { useStudentCertificate } from "@/features/student-certificates/hooks/use-student-certificates";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export function StudentCertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: certificate, isLoading } = useStudentCertificate(Number(id));

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate("/student-certificates")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chứng chỉ</h1>
          <p className="text-sm text-muted-foreground mt-1">{certificate.certCode}</p>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Đã cấp
        </Badge>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Thông tin chứng chỉ</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Học viên</p>
            <p className="font-medium">{certificate.user?.name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{certificate.user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Khóa học</p>
            <p className="font-medium">{certificate.course?.title || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mã chứng chỉ</p>
            <p className="font-mono text-sm">{certificate.certCode}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày cấp</p>
            <p className="font-medium">{new Date(certificate.issuedAt).toLocaleDateString("vi-VN")}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">PDF</p>
            <a href={certificate.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Xem PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
