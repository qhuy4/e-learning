import { useParams, useNavigate } from "react-router-dom";
import { useNotification, useMarkAsRead, useDeleteNotification } from "@/features/notifications/hooks/use-notifications";
import { typeLabels, typeClassName } from "@/features/notifications/components/notification-columns";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: notification, isLoading } = useNotification(id || "");
  const markAsReadMutation = useMarkAsRead();
  const deleteMutation = useDeleteNotification();

  const handleMarkRead = () => {
    if (!id) return;
    markAsReadMutation.mutate(id, {
      onSuccess: () => toast.success("Đã đánh dấu là đã đọc"),
    });
  };

  const handleDelete = () => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Đã xóa thông báo");
        navigate("/notifications");
      },
      onError: () => toast.error("Không thể xóa thông báo"),
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

  if (!notification) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Không tìm thấy thông báo.</p>
      </div>
    );
  }

  const typeLabel = typeLabels[notification.type] || notification.type;
  const typeClass = typeClassName[notification.type] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate("/notifications")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {!notification.isRead && (
            <Button variant="outline" onClick={handleMarkRead} disabled={markAsReadMutation.isPending}>
              Đánh dấu đã đọc
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4 mr-1" />
            Xóa
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className={typeClass}>{typeLabel}</Badge>
          {!notification.isRead && <span className="text-xs text-blue-500 font-medium">Chưa đọc</span>}
        </div>
        <h1 className="text-2xl font-bold">{notification.title || "Không có tiêu đề"}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date(notification.createdAt).toLocaleString("vi-VN")}
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Nội dung</h2>
        </div>
        <div className="p-6">
          <p className="whitespace-pre-wrap">{notification.body || "Không có nội dung"}</p>
        </div>
      </div>

      {notification.actionUrl && (
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">Liên kết</h2>
          </div>
          <div className="p-6">
            <a href={notification.actionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {notification.actionUrl}
            </a>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Thông tin chi tiết</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Loại thông báo</p>
            <p className="font-medium">{notification.type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Người nhận</p>
            <p className="font-medium">{notification.user?.name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Loại đối tượng</p>
            <p className="font-medium">{notification.notifiableType || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ID đối tượng</p>
            <p className="font-medium">{notification.notifiableId}</p>
          </div>
          {notification.entityType && (
            <div>
              <p className="text-sm text-muted-foreground">Liên kết thực thể</p>
              <p className="font-medium">{notification.entityType} #{notification.entityId}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Đã đọc</p>
            <p className="font-medium">{notification.isRead ? "Có" : "Chưa"}</p>
          </div>
          {notification.readAt && (
            <div>
              <p className="text-sm text-muted-foreground">Ngày đọc</p>
              <p className="font-medium">{new Date(notification.readAt).toLocaleString("vi-VN")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
