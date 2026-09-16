import { useState, useEffect } from "react";
import { Button } from "@fe/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fe/components/ui/dialog.tsx";
import { Label } from "@fe/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select.tsx";
import { useInstructors } from "@/features/instructors/hook/use-instructors";
import { useInstructor } from "@/features/instructors/hook/use-instructors";
import { usePayoutAccounts } from "@/features/instructors/hooks/use-payout-accounts";
import { useCreatePayout } from "@/features/earnings/hooks/use-earnings";
import { toast } from "sonner";

interface CreatePayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePayoutDialog({ open, onOpenChange }: CreatePayoutDialogProps) {
  const [instructorId, setInstructorId] = useState("");
  const [payoutAccountId, setPayoutAccountId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const { data: instructorsData } = useInstructors(1, 100);
  const instructors = instructorsData?.data ?? [];

  const selectedInstructorId = instructorId ? Number(instructorId) : 0;
  const { data: instructorDetail } = useInstructor(selectedInstructorId);
  const profileId = instructorDetail?.profile?.id;

  const { data: accountsData } = usePayoutAccounts(String(profileId ?? ""));
  const accounts = accountsData?.data ?? [];

  const createPayoutMutation = useCreatePayout();

  useEffect(() => {
    setPayoutAccountId("");
  }, [instructorId]);

  const handleSubmit = () => {
    if (!instructorId || !payoutAccountId || !periodStart || !periodEnd) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    createPayoutMutation.mutate(
      {
        instructorId: Number(instructorId),
        payoutAccountId: Number(payoutAccountId),
        periodStart,
        periodEnd,
      },
      {
        onSuccess: () => {
          toast.success("Tạo thanh toán thành công");
          onOpenChange(false);
          resetForm();
        },
        onError: () => toast.error("Không thể tạo thanh toán"),
      },
    );
  };

  const resetForm = () => {
    setInstructorId("");
    setPayoutAccountId("");
    setPeriodStart("");
    setPeriodEnd("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo thanh toán mới</DialogTitle>
          <DialogDescription>
            Tạo khoản thanh toán cho giảng viên
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Giảng viên</Label>
            <Select value={instructorId} onValueChange={setInstructorId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn giảng viên" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map((inst) => (
                  <SelectItem key={inst.id} value={String(inst.id)}>
                    {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tài khoản nhận tiền</Label>
            <Select value={payoutAccountId} onValueChange={setPayoutAccountId} disabled={!instructorId}>
              <SelectTrigger>
                <SelectValue placeholder={accounts.length ? "Chọn tài khoản" : "Không có tài khoản"} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={String(acc.id)}>
                    {acc.accountHolderName} — {acc.bankName ?? acc.paypalEmail ?? acc.accountType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Từ ngày</Label>
              <input
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <input
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={createPayoutMutation.isPending}>
            {createPayoutMutation.isPending ? "Đang tạo..." : "Tạo thanh toán"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
