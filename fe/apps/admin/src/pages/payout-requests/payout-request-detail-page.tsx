import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { Button } from "@fe/components/ui/button.tsx";
import { Badge } from "@fe/components/ui/badge.tsx";
import { Separator } from "@fe/components/ui/separator.tsx";
import { usePayout, useUpdatePayoutStatus } from "@/features/earnings/hooks/use-earnings";
import {
  PayoutStatus,
  payoutStatusLabel,
  payoutStatusClassName,
  paymentMethodLabel,
  formatCurrency,
} from "@/features/earnings/types/earnings";
import { toast } from "sonner";

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PayoutRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: payout, isLoading, isError } = usePayout(id ?? "");
  const updateStatusMutation = useUpdatePayoutStatus();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (isError || !payout) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy yêu cầu rút tiền.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/payout-requests")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const currentStatus = payout.status as PayoutStatus;

  const handleApprove = () => {
    updateStatusMutation.mutate(
      { id: payout.id, data: { status: PayoutStatus.APPROVED } },
      {
        onSuccess: () => toast.success("Đã duyệt yêu cầu rút tiền"),
        onError: () => toast.error("Không thể duyệt yêu cầu"),
      },
    );
  };

  const handleReject = () => {
    updateStatusMutation.mutate(
      { id: payout.id, data: { status: PayoutStatus.REJECTED } },
      {
        onSuccess: () => toast.success("Đã từ chối yêu cầu rút tiền"),
        onError: () => toast.error("Không thể từ chối yêu cầu"),
      },
    );
  };

  const handleMarkPaid = () => {
    updateStatusMutation.mutate(
      {
        id: payout.id,
        data: {
          status: PayoutStatus.PAID,
          paidAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => toast.success("Đã đánh dấu đã thanh toán"),
        onError: () => toast.error("Không thể cập nhật"),
      },
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/payout-requests")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
        <div className="flex gap-2">
          {currentStatus === PayoutStatus.PENDING && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="mr-2 h-4 w-4" /> Từ chối
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Duyệt
              </Button>
            </>
          )}
          {currentStatus === PayoutStatus.APPROVED && (
            <Button
              size="sm"
              onClick={handleMarkPaid}
              disabled={updateStatusMutation.isPending}
            >
              <DollarSign className="mr-2 h-4 w-4" /> Đã thanh toán
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold">Yêu cầu rút tiền #{payout.id}</h1>
          <Badge className={`mt-1 ${payoutStatusClassName[currentStatus]}`}>
            {payoutStatusLabel[currentStatus]}
          </Badge>
        </div>

        <Separator />

        <Section title="Thông tin giảng viên">
          <Field label="Giảng viên" value={payout.instructor?.name ?? "—"} />
          <Field label="Phương thức" value={paymentMethodLabel[payout.paymentMethod as keyof typeof paymentMethodLabel] ?? "—"} />
          <Field label="Tài khoản nhận" value={payout.payoutAccount?.accountHolderName ?? "—"} />
          {payout.payoutAccount?.bankName && (
            <Field label="Ngân hàng" value={payout.payoutAccount.bankName} />
          )}
          {payout.payoutAccount?.accountNumber && (
            <Field label="Số tài khoản" value={payout.payoutAccount.accountNumber} />
          )}
          {payout.payoutAccount?.paypalEmail && (
            <Field label="PayPal" value={payout.payoutAccount.paypalEmail} />
          )}
        </Section>

        <Separator />

        <Section title="Kỳ thanh toán">
          <Field label="Từ ngày" value={formatDate(payout.periodStart)} />
          <Field label="Đến ngày" value={formatDate(payout.periodEnd)} />
        </Section>

        <Separator />

        <Section title="Số tiền">
          <Field label="Tổng gross" value={formatCurrency(payout.totalGross)} />
          <Field label="Platform fee" value={formatCurrency(payout.totalPlatformFee)} />
          <Field label="Giảng viên nhận" value={formatCurrency(payout.totalInstructorAmount)} />
          <Field label="Tiền tệ" value={payout.currency} />
        </Section>

        <Separator />

        <Section title="Giao dịch">
          <Field label="Mã giao dịch" value={payout.transactionRef ?? "—"} />
          <Field label="Ghi chú" value={payout.note ?? "—"} />
          <Field label="Ngày tạo" value={formatDate(payout.createdAt)} />
          <Field label="Ngày thanh toán" value={formatDate(payout.paidAt)} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
