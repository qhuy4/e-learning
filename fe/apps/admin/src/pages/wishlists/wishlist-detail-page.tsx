import { useParams, useNavigate } from "react-router-dom";
import { useWishlist, useDeleteWishlist, useDeleteWishlistItem } from "@/features/wishlists/hooks/use-wishlists";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { ArrowLeft, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export function WishlistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: wishlist, isLoading } = useWishlist(Number(id));
  const deleteMutation = useDeleteWishlist();
  const deleteItemMutation = useDeleteWishlistItem();

  const handleDelete = () => {
    deleteMutation.mutate(Number(id), {
      onSuccess: () => {
        toast.success("Đã xóa danh sách");
        navigate("/wishlists");
      },
      onError: () => toast.error("Không thể xóa"),
    });
  };

  const handleRemoveItem = (itemId: number) => {
    deleteItemMutation.mutate(
      { wishlistId: Number(id), itemId },
      { onSuccess: () => toast.success("Đã xóa khóa học") },
    );
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

  if (!wishlist) {
    return <div className="p-6"><p className="text-muted-foreground">Không tìm thấy danh sách.</p></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate("/wishlists")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
          </Button>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
          <Trash2 className="h-4 w-4 mr-1" /> Xóa danh sách
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{wishlist.name}</h1>
        {wishlist.isDefault && <Badge variant="outline">Mặc định</Badge>}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Thông tin</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Học viên</p>
            <p className="font-medium">{wishlist.user?.name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{wishlist.user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Số khóa học</p>
            <p className="font-medium">{wishlist.items?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày tạo</p>
            <p className="font-medium">{new Date(wishlist.createdAt).toLocaleDateString("vi-VN")}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Khóa học trong danh sách</h2>
        </div>
        <div className="divide-y">
          {(!wishlist.items || wishlist.items.length === 0) ? (
            <div className="p-6 text-center text-muted-foreground">Không có khóa học nào.</div>
          ) : (
            wishlist.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium">{item.course?.title || "Khóa học #" + item.courseId}</p>
                  <p className="text-sm text-muted-foreground">
                    Thêm ngày {new Date(item.addedAt).toLocaleDateString("vi-VN")}
                    {item.note && ` — ${item.note}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={deleteItemMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
