import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, CreditCard, Save, TimerReset } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Skeleton } from "@fe/components/ui/skeleton";
import { useTeachingProfile, useUpdateTeachingProfile } from "@/features/teaching-profile/hooks/use-teaching-profile";
import { getErrorMessage } from "@/shared/utils/error";

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

export default function SessionPricingPage() {
  const { data: profile, isLoading } = useTeachingProfile();
  const update = useUpdateTeachingProfile();
  const [hourlyRate, setHourlyRate] = useState("");

  useEffect(() => {
    if (profile) setHourlyRate(profile.hourlyRate > 0 ? String(profile.hourlyRate) : "");
  }, [profile]);

  const amount = Number(hourlyRate) || 0;
  const save = () => {
    update.mutate(
      { hourlyRate: amount },
      {
        onSuccess: () => toast.success("Đã cập nhật học phí 1:1"),
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  if (isLoading) {
    return <div className="p-6 space-y-6"><Skeleton className="h-10 w-60" /><Skeleton className="h-72 max-w-3xl" /></div>;
  }

  return (
    <div className="w-full space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><Banknote className="size-4" /></span>
            <Badge variant="secondary">Buổi học 1:1</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Học phí 1:1</h1>
          <p className="mt-1 text-sm text-muted-foreground">Thiết lập đơn giá áp dụng cho các lịch học trực tuyến của bạn.</p>
        </div>
        <Badge className={amount > 0 ? "bg-emerald-600 hover:bg-emerald-600" : "bg-muted text-muted-foreground hover:bg-muted"}>
          {amount > 0 ? "Đang mở nhận lịch" : "Chưa mở nhận lịch"}
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader>
            <CardTitle>Đơn giá theo giờ</CardTitle>
            <CardDescription>Giá được chốt tại thời điểm học viên tạo thanh toán.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Học phí mỗi giờ</Label>
              <div className="flex w-full max-w-xl overflow-hidden rounded-xl border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring/30">
                <Input id="hourlyRate" type="number" min={0} step={10000} placeholder="Ví dụ: 250000" className="h-14 flex-1 rounded-none border-0 bg-transparent px-4 text-xl font-bold shadow-none focus-visible:ring-0" value={hourlyRate} onChange={(event) => setHourlyRate(event.target.value)} />
                <span className="flex shrink-0 items-center border-l border-input bg-muted px-5 text-sm font-bold text-muted-foreground">VND / giờ</span>
              </div>
              <p className="text-xs text-muted-foreground">Đặt 0 để tạm ngưng nhận lịch mới.</p>
            </div>
            <div className="flex justify-end border-t pt-4">
              <Button onClick={save} disabled={update.isPending}><Save className="mr-1.5 size-4" />{update.isPending ? "Đang lưu..." : "Lưu học phí"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/[0.03] xl:col-span-5">
          <CardHeader className="pb-3"><CardTitle className="text-base">Xem trước</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-sm text-muted-foreground">Học viên sẽ thấy</p><p className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{formatVnd(amount)}<span className="ml-1 text-sm font-semibold">/ giờ</span></p></div>
            <div className="space-y-3 border-t pt-4 text-sm text-muted-foreground">
              <p className="flex gap-2"><CreditCard className="mt-0.5 size-4 shrink-0 text-primary" />Thanh toán toàn bộ qua VNPay trước khi xác nhận lịch.</p>
              <p className="flex gap-2"><TimerReset className="mt-0.5 size-4 shrink-0 text-primary" />Một lần checkout giữ khung giờ tối đa 15 phút.</p>
              <p className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />Thanh toán xong, phòng học trực tuyến được tạo tự động.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
