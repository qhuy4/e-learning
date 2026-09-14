import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePremiumSubscription, useUpdatePremiumSubscription, useDeletePremiumSubscription } from "@/features/premium-subscriptions/hooks/use-premium-subscriptions";
import { subscriptionStatusLabel, subscriptionStatusClassName } from "@/features/premium-subscriptions/types/premium-subscription";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fe/components/ui/select";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function PremiumSubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: subscription, isLoading } = usePremiumSubscription(Number(id));
  const updateMutation = useUpdatePremiumSubscription();
  const deleteMutation = useDeletePremiumSubscription();
  const [editMode, setEditMode] = useState(false);
  const [statusValue, setStatusValue] = useState<string>("");

  const handleSave = () => {
    updateMutation.mutate(
      { id: Number(id), data: { status: Number(statusValue) } },
      {
        onSuccess: () => {
          toast.success("Cập nhật thành công");
          setEditMode(false);
        },
        onError: () => toast.error("Không thể cập nhật"),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(Number(id), {
      onSuccess: () => {
        toast.success("Đã xóa");
        navigate("/premium-subscriptions");
      },
      onError: () => toast.error("Không thể xóa"),
    });
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

  if (!subscription) {
    return <div className="p-6"><p className="text-muted-foreground">Không tìm thấy gói đăng ký.</p></div>;
  }

  const status = subscription.status;
  const isExpired = new Date(subscription.expiredAt) < new Date();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate("/premium-subscriptions")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {!editMode ? (
            <>
              <Button variant="outline" onClick={() => { setEditMode(true); setStatusValue(String(status)); }}>
                Chỉnh sửa
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                <Trash2 className="h-4 w-4 mr-1" /> Xóa
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
              </Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>Hủy</Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Gói Premium — {subscription.user?.name || "—"}</h1>
        {isExpired ? (
          <Badge variant="outline" className={subscriptionStatusClassName[0]}>{subscriptionStatusLabel[0]}</Badge>
        ) : (
          <Badge variant="outline" className={subscriptionStatusClassName[status]}>{subscriptionStatusLabel[status]}</Badge>
        )}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Thông tin gói</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Học viên</p>
            <p className="font-medium">{subscription.user?.name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{subscription.user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày bắt đầu</p>
            <p className="font-medium">{new Date(subscription.startedAt).toLocaleDateString("vi-VN")}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày hết hạn</p>
            <p className="font-medium">{new Date(subscription.expiredAt).toLocaleDateString("vi-VN")}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trạng thái</p>
            {editMode ? (
              <Select value={statusValue} onValueChange={setStatusValue}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue>
                    {subscriptionStatusLabel[Number(statusValue)] || "Chọn trạng thái"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(subscriptionStatusLabel).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="font-medium">{subscriptionStatusLabel[status] || "—"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
