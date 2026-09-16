import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Ban, CircleDollarSign } from "lucide-react";
import { Button } from "@fe/components/ui/button.tsx";
import { Badge } from "@fe/components/ui/badge.tsx";
import { Separator } from "@fe/components/ui/separator.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fe/components/ui/dialog.tsx";
import { Input } from "@fe/components/ui/input.tsx";
import { Label } from "@fe/components/ui/label.tsx";
import {
  usePayment,
  useRefundPayment,
  useRetryPayment,
  useCancelPayment,
} from "@/features/payments/hooks/use-payments";
import {
  PaymentStatus,
  paymentStatusLabel,
  paymentStatusClassName,
  paymentGatewayLabel,
  formatPaymentAmount,
} from "@/features/payments/types/payments";
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

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: payment, isLoading, isError } = usePayment(id ?? "");
  const refundMutation = useRefundPayment();
  const retryMutation = useRetryPayment();
  const cancelMutation = useCancelPayment();

  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy giao dịch.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/payments")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const currentStatus = payment.status as PaymentStatus;

  const handleRefund = () => {
    refundMutation.mutate(
      { id: payment.id, reason: refundReason || undefined },
      {
        onSuccess: () => {
          toast.success("Hoàn tiền thành công");
          setRefundOpen(false);
          setRefundReason("");
        },
        onError: () => toast.error("Không thể hoàn tiền"),
      },
    );
  };

  const handleRetry = () => {
    retryMutation.mutate(
      { id: payment.id },
      {
        onSuccess: () => toast.success("Đã gửi lại thanh toán"),
        onError: () => toast.error("Không thể gửi lại thanh toán"),
      },
    );
  };

  const handleCancel = () => {
    cancelMutation.mutate(payment.id, {
      onSuccess: () => toast.success("Đã hủy thanh toán"),
      onError: () => toast.error("Không thể hủy thanh toán"),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/payments")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
        <div className="flex gap-2">
          {currentStatus === PaymentStatus.FAILED && (
            <Button size="sm" variant="outline" onClick={handleRetry} disabled={retryMutation.isPending}>
              <RefreshCw className="mr-2 h-4 w-4" /> Gửi lại
            </Button>
          )}
          {currentStatus === PaymentStatus.COMPLETED && (
            <Button size="sm" variant="outline" onClick={() => setRefundOpen(true)} disabled={refundMutation.isPending}>
              <CircleDollarSign className="mr-2 h-4 w-4" /> Hoàn tiền
            </Button>
          )}
          {(currentStatus === PaymentStatus.PENDING || currentStatus === PaymentStatus.PROCESSING) && (
            <Button size="sm" variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending}>
              <Ban className="mr-2 h-4 w-4" /> Hủy
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold">Giao dịch #{payment.id}</h1>
          <Badge className={`mt-1 ${paymentStatusClassName[currentStatus]}`}>
            {paymentStatusLabel[currentStatus]}
          </Badge>
        </div>

        <Separator />

        <Section title="Thông tin giao dịch">
          <Field label="Đơn hàng" value={`#${payment.orderId}`} />
          <Field label="Cổng thanh toán" value={paymentGatewayLabel[payment.gateway] ?? payment.gateway} />
          <Field label="Số tiền" value={formatPaymentAmount(payment.amount)} />
          <Field label="Tiền tệ" value={payment.currency} />
          <Field label="Mã giao dịch" value={payment.transactionId ?? "—"} />
        </Section>

        <Separator />

        <Section title="Thời gian">
          <Field label="Ngày tạo" value={formatDate(payment.createdAt)} />
          <Field label="Ngày thanh toán" value={formatDate(payment.paidAt)} />
          <Field label="Cập nhật" value={formatDate(payment.updatedAt)} />
        </Section>

        {payment.gatewayResponse && (
          <>
            <Separator />
            <Section title="Phản hồi cổng thanh toán">
              <pre className="text-xs bg-muted rounded-lg p-4 overflow-auto max-h-60">
                {JSON.stringify(payment.gatewayResponse, null, 2)}
              </pre>
            </Section>
          </>
        )}
      </div>

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hoàn tiền giao dịch</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hoàn tiền giao dịch #{payment.id}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Lý do (tùy chọn)</Label>
            <Input
              placeholder="Nhập lý do hoàn tiền..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              disabled={refundMutation.isPending}
            >
              {refundMutation.isPending ? "Đang xử lý..." : "Hoàn tiền"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
