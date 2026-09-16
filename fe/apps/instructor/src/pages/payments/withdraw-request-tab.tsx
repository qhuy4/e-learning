import { useState } from "react";
import { toast } from "sonner";
import { Wallet, Send, CreditCard, AlertCircle } from "lucide-react";
import { useRevenueSummary } from "@/features/revenue/hook/use-revenue";
import { usePayoutAccounts, useRequestPayout } from "@/features/payments/hooks/use-payments";
import { getErrorMessage } from "@/shared/utils/error";
import { Button } from "@fe/components/ui/button";
import { Label } from "@fe/components/ui/label";
import { Card, CardContent } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function WithdrawRequestTab() {
  const { data: summaryData, isLoading: summaryLoading } = useRevenueSummary();
  const { data: accountsData, isLoading: accountsLoading } = usePayoutAccounts();
  const { mutateAsync: requestPayout, isPending } = useRequestPayout();

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const summary = summaryData?.data;
  const accounts = (accountsData?.data ?? []) as any[];
  const availableBalance = summary?.pendingPayout ?? 0;

  const canSubmit = selectedAccountId && availableBalance > 0;

  const handleSubmit = async () => {
    if (!selectedAccountId) return;
    const tid = toast.loading("Đang gửi yêu cầu rút tiền...");
    try {
      await requestPayout({ payoutAccountId: selectedAccountId });
      toast.success("Đã gửi yêu cầu rút tiền! Chờ admin phê duyệt.", { id: tid });
      setSelectedAccountId(null);
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    } finally {
      setConfirmOpen(false);
    }
  };

  if (summaryLoading || accountsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Số dư khả dụng</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(availableBalance)}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
          {availableBalance <= 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Chưa có số dư để rút. Doanh thu sẽ được cập nhật khi học viên mua khóa học.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Send className="h-5 w-5" />
            Yêu cầu rút tiền
          </h3>

          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Tài khoản nhận tiền
            </Label>
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Bạn chưa có tài khoản nhận tiền. Vui lòng thêm tài khoản ở tab "Tài khoản nhận tiền".
              </p>
            ) : (
              <div className="space-y-2">
                {accounts.map((account: any) => (
                  <label
                    key={account.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAccountId === account.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payout-account"
                      checked={selectedAccountId === account.id}
                      onChange={() => setSelectedAccountId(account.id)}
                      className="accent-primary"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{account.accountHolderName}</p>
                      <p className="text-xs text-muted-foreground">
                        {account.accountType === "bank"
                          ? `${account.bankName ?? "Ngân hàng"} - ${account.accountNumber ?? ""}`
                          : `PayPal - ${account.paypalEmail ?? ""}`}
                      </p>
                    </div>
                    {account.isPrimary && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        Mặc định
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!canSubmit || isPending}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0"
          >
            <Send className="h-4 w-4 mr-2" />
            {isPending ? "Đang gửi..." : "Gửi yêu cầu rút tiền"}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận rút tiền"
        description="Bạn có chắc chắn muốn gửi yêu cầu rút tiền? Yêu cầu sẽ được gửi cho admin phê duyệt."
        confirmLabel="Xác nhận"
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
