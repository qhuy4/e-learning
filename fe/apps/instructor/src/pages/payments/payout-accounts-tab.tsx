import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  CreditCard,
  Plus,
  Trash2,
  Edit,
  Building,
  Mail,
  CheckCircle,
  Star,
  Shield,
  ShieldOff,
  Loader2,
} from "lucide-react";
import {
  usePayoutAccounts,
  useCreatePayoutAccount,
  useUpdatePayoutAccount,
  useDeletePayoutAccount,
  useCreateGrantToken,
  useVerifyAccount,
} from "@/features/payments/hooks/use-payments";
import { getErrorMessage } from "@/shared/utils/error";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Badge } from "@fe/components/ui/badge";
import { Card, CardContent } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";

declare const BankHub: {
  useBankHubLink: (config: {
    redirectUri: string;
    iframe: boolean;
    grantToken: string;
    onSuccess: (publicToken: string, state: string) => void;
    onExit: () => void;
  }) => { open: () => void; close: () => void };
};

type AccountForm = {
  accountType: string;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  bankBranch: string;
  routingCode: string;
  paypalEmail: string;
  currency: string;
  isPrimary: boolean;
};

const EMPTY_FORM: AccountForm = {
  accountType: "bank",
  accountHolderName: "",
  accountNumber: "",
  bankName: "",
  bankBranch: "",
  routingCode: "",
  paypalEmail: "",
  currency: "VND",
  isPrimary: false,
};

const CAS_REDIRECT_URI = import.meta.env.VITE_CAS_REDIRECT_URI || "http://localhost:5175/payments/cas-callback";

export function PayoutAccountsTab() {
  const { data, isLoading } = usePayoutAccounts();
  const { mutateAsync: createAccount, isPending: isCreating } = useCreatePayoutAccount();
  const { mutateAsync: updateAccount, isPending: isUpdating } = useUpdatePayoutAccount();
  const { mutateAsync: deleteAccount } = useDeletePayoutAccount();
  const { mutateAsync: createGrantToken, isPending: isLinking } = useCreateGrantToken();
  const { mutateAsync: verifyAccount, isPending: isVerifying } = useVerifyAccount();

  const accounts = (data?.data ?? []) as any[];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AccountForm>(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [verifyingAccountId, setVerifyingAccountId] = useState<number | null>(null);

  const isSaving = isCreating || isUpdating;

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (account: any) => {
    setForm({
      accountType: account.accountType ?? "bank",
      accountHolderName: account.accountHolderName ?? "",
      accountNumber: account.accountNumber ?? "",
      bankName: account.bankName ?? "",
      bankBranch: account.bankBranch ?? "",
      routingCode: account.routingCode ?? "",
      paypalEmail: account.paypalEmail ?? "",
      currency: account.currency ?? "VND",
      isPrimary: account.isPrimary ?? false,
    });
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.accountHolderName.trim()) {
      toast.error("Vui lòng nhập tên chủ tài khoản.");
      return;
    }
    if (form.accountType === "bank" && !form.accountNumber.trim()) {
      toast.error("Vui lòng nhập số tài khoản.");
      return;
    }
    if (form.accountType === "paypal" && !form.paypalEmail.trim()) {
      toast.error("Vui lòng nhập email PayPal.");
      return;
    }

    const tid = toast.loading(editingId ? "Đang cập nhật..." : "Đang thêm...");
    try {
      if (editingId) {
        await updateAccount({ id: editingId, data: form });
        toast.success("Đã cập nhật tài khoản!", { id: tid });
      } else {
        await createAccount(form);
        toast.success("Đã thêm tài khoản!", { id: tid });
      }
      resetForm();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const tid = toast.loading("Đang xóa...");
    try {
      await deleteAccount(deletingId);
      toast.success("Đã xóa tài khoản!", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    } finally {
      setDeletingId(null);
    }
  };

  const handleVerify = useCallback(
    async (accountId: number) => {
      setVerifyingAccountId(accountId);
      try {
        const result = await createGrantToken(accountId);
        const { grantToken } = result.data ?? result;
        const state = `accountId=${accountId}`;

        if (typeof BankHub !== "undefined" && BankHub.useBankHubLink) {
          const { open } = BankHub.useBankHubLink({
            redirectUri: CAS_REDIRECT_URI,
            iframe: true,
            grantToken,
            state,
            onSuccess: async (publicToken: string, returnedState: string) => {
              const match = returnedState?.match(/^accountId=(\d+)$/);
              const resolvedAccountId = match ? parseInt(match[1], 10) : accountId;
              try {
                const verifyResult = await verifyAccount({ accountId: resolvedAccountId, publicToken });
                const { verified } = verifyResult.data ?? verifyResult;
                if (verified) {
                  toast.success("Đã xác minh tài khoản thành công!");
                } else {
                  toast.error("Xác minh thất bại. Vui lòng kiểm tra lại tên chủ tài khoản.");
                }
              } catch (err) {
                toast.error(getErrorMessage(err));
              } finally {
                setVerifyingAccountId(null);
              }
            },
            onExit: () => {
              setVerifyingAccountId(null);
            },
          });
          open();
        } else {
          const { casLinkUrl } = result.data ?? result;
          const popup = window.open(
            casLinkUrl,
            "cas-link",
            "width=500,height=700,scrollbars=yes,resizable=yes"
          );

          const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type !== "CAS_LINK_SUCCESS") return;

            window.removeEventListener("message", handleMessage);
            popup?.close();

            const { publicToken, state: returnedState } = event.data;
            const match = returnedState?.match(/^accountId=(\d+)$/);
            const resolvedAccountId = match ? parseInt(match[1], 10) : accountId;

            try {
              const verifyResult = await verifyAccount({
                accountId: resolvedAccountId,
                publicToken,
              });
              const { verified } = verifyResult.data ?? verifyResult;
              if (verified) {
                toast.success("Đã xác minh tài khoản thành công!");
              } else {
                toast.error("Xác minh thất bại. Vui lòng kiểm tra lại tên chủ tài khoản.");
              }
            } catch (err) {
              toast.error(getErrorMessage(err));
            } finally {
              setVerifyingAccountId(null);
            }
          };

          window.addEventListener("message", handleMessage);

          const pollTimer = setInterval(() => {
            if (popup?.closed) {
              clearInterval(pollTimer);
              window.removeEventListener("message", handleMessage);
              setVerifyingAccountId(null);
            }
          }, 500);
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
        setVerifyingAccountId(null);
      }
    },
    [createGrantToken, verifyAccount]
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Tài khoản nhận tiền
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý tài khoản ngân hàng hoặc PayPal để nhận thanh toán.
          </p>
        </div>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Thêm tài khoản
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h4 className="font-medium">{editingId ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}</h4>

            <div className="space-y-2">
              <Label className="font-medium">Loại tài khoản</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={form.accountType === "bank" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setForm({ ...form, accountType: "bank" })}
                >
                  <Building className="h-4 w-4 mr-1.5" />
                  Ngân hàng
                </Button>
                <Button
                  type="button"
                  variant={form.accountType === "paypal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setForm({ ...form, accountType: "paypal" })}
                >
                  <Mail className="h-4 w-4 mr-1.5" />
                  PayPal
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Tên chủ tài khoản *</Label>
              <Input
                value={form.accountHolderName}
                onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                placeholder="NGUYEN VAN A"
              />
            </div>

            {form.accountType === "bank" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium">Mã ngân hàng (BIN) *</Label>
                  <Input
                    value={form.routingCode}
                    onChange={(e) => setForm({ ...form, routingCode: e.target.value })}
                    placeholder="970416"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Số tài khoản *</Label>
                  <Input
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Tên ngân hàng</Label>
                  <Input
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    placeholder="Vietcombank"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Chi nhánh</Label>
                  <Input
                    value={form.bankBranch}
                    onChange={(e) => setForm({ ...form, bankBranch: e.target.value })}
                    placeholder="Chi nhánh Hà Nội"
                  />
                </div>
              </div>
            )}

            {form.accountType === "paypal" && (
              <div className="space-y-2">
                <Label className="font-medium">Email PayPal *</Label>
                <Input
                  type="email"
                  value={form.paypalEmail}
                  onChange={(e) => setForm({ ...form, paypalEmail: e.target.value })}
                  placeholder="example@paypal.com"
                />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPrimary}
                onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                className="accent-primary rounded"
              />
              <span className="text-sm font-medium">Đặt làm tài khoản mặc định</span>
            </label>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0"
              >
                {isSaving ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm mới"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {accounts.length === 0 && !showForm ? (
        <Card>
          <CardContent className="p-10 text-center">
            <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản nhận tiền. Hãy thêm tài khoản để bắt đầu nhận thanh toán.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map((account: any) => (
            <Card key={account.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-muted p-2">
                  {account.accountType === "bank" ? (
                    <Building className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{account.accountHolderName}</p>
                    {account.isPrimary && (
                      <Badge className="bg-primary/10 text-primary text-[10px]">
                        <Star className="h-3 w-3 mr-0.5" />
                        Mặc định
                      </Badge>
                    )}
                    {account.isVerified ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px]">
                        <CheckCircle className="h-3 w-3 mr-0.5" />
                        Đã xác minh
                      </Badge>
                    ) : account.accountType === "bank" ? (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        <ShieldOff className="h-3 w-3 mr-0.5" />
                        Chưa xác minh
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {account.accountType === "bank"
                      ? `${account.bankName ?? "Ngân hàng"} - ${account.accountNumber ?? ""}`
                      : `PayPal - ${account.paypalEmail ?? ""}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {account.accountType === "bank" && !account.isVerified && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                      onClick={() => handleVerify(account.id)}
                      disabled={verifyingAccountId === account.id || isLinking}
                    >
                      {verifyingAccountId === account.id ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Shield className="h-3.5 w-3.5 mr-1" />
                      )}
                      Xác minh
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => handleEdit(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeletingId(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deletingId !== null}
        title="Xóa tài khoản nhận tiền"
        description="Bạn có chắc chắn muốn xóa tài khoản nhận tiền này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
