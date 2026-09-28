import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { Button } from "@fe/components/ui/button.tsx";
import { Badge } from "@fe/components/ui/badge.tsx";
import { Separator } from "@fe/components/ui/separator.tsx";
import { Input } from "@fe/components/ui/input.tsx";
import { Label } from "@fe/components/ui/label.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fe/components/ui/dialog.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select.tsx";
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

function formatPeriod(start: string, end: string) {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export default function PayoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: payout, isLoading, isError } = usePayout(id ?? "");
  const updateStatusMutation = useUpdatePayoutStatus();

  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "mark_paid">("approve");
  const [transactionRef, setTransactionRef] = useState("");
  const [note, setNote] = useState("");

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
        <p className="text-muted-foreground">Không tìm thấy khoản thanh toán.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/earnings")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>
    );
  }

  const currentStatus = payout.status as PayoutStatus;

  const handleAction = (type: "approve" | "reject" | "mark_paid") => {
    setActionType(type);
    setTransactionRef("");
    setNote("");
    setActionOpen(true);
  };

  const submitAction = () => {
    let status: PayoutStatus;
    if (actionType === "approve") status = PayoutStatus.APPROVED;
    else if (actionType === "reject") status = PayoutStatus.REJECTED;
    else status = PayoutStatus.PAID;

    updateStatusMutation.mutate(
      {
        id: payout.id,
        data: {
          status,
          transactionRef: transactionRef || undefined,
          note: note || undefined,
          paidAt: actionType === "mark_paid" ? new Date().toISOString() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Cập nhật trạng thái thành công");
          setActionOpen(false);
        },
        onError: () => toast.error("Không thể cập nhật trạng thái"),
      },
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/earnings")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
        <div className="flex gap-2">
          {currentStatus === PayoutStatus.PENDING && (
            <>
              <Button size="sm" variant="outline" onClick={() => handleAction("reject")} disabled={updateStatusMutation.isPending}>
                <XCircle className="mr-2 h-4 w-4" /> Từ chối
              </Button>
              <Button size="sm" onClick={() => handleAction("approve")} disabled={updateStatusMutation.isPending}>
                <CheckCircle className="mr-2 h-4 w-4" /> Duyệt
              </Button>
            </>
          )}
          {currentStatus === PayoutStatus.APPROVED && (
            <Button size="sm" onClick={() => handleAction("mark_paid")} disabled={updateStatusMutation.isPending}>
              <DollarSign className="mr-2 h-4 w-4" /> Đã thanh toán
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold">Thanh toán #{payout.id}</h1>
          <Badge className={`mt-1 ${payoutStatusClassName[currentStatus]}`}>
            {payoutStatusLabel[currentStatus]}
          </Badge>
        </div>

        <Separator />

        <Section title="Thông tin giảng viên">
          <Field label="Giảng viên" value={payout.instructor?.name ?? "—"} />
          <Field label="Phương thức" value={paymentMethodLabel[payout.paymentMethod as keyof typeof paymentMethodLabel] ?? "—"} />
          <Field label="Tài khoản" value={payout.payoutAccount?.accountHolderName ?? "—"} />
          {payout.payoutAccount?.bankName && (
            <Field label="Ngân hàng" value={payout.payoutAccount.bankName} />
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

      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Duyệt thanh toán"}
              {actionType === "reject" && "Từ chối thanh toán"}
              {actionType === "mark_paid" && "Xác nhận đã thanh toán"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && "Xác nhận duyệt khoản thanh toán này?"}
              {actionType === "reject" && "Bạn có chắc chắn muốn từ chối khoản thanh toán này?"}
              {actionType === "mark_paid" && "Xác nhận đã thanh toán khoản tiền này?"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(actionType === "approve" || actionType === "mark_paid") && (
              <div className="space-y-2">
                <Label>Mã giao dịch (tùy chọn)</Label>
                <Input
                  placeholder="Nhập mã giao dịch..."
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Ghi chú (tùy chọn)</Label>
              <Input
                placeholder="Nhập ghi chú..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionOpen(false)}>
              Hủy
            </Button>
            <Button
              variant={actionType === "reject" ? "destructive" : "default"}
              onClick={submitAction}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
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
