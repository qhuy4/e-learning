import React, { useState } from "react";
import { Star, Trash2, X, User, TriangleAlert } from "lucide-react";
import type { ReviewItem } from "../types/review.type";
import { useDeleteReview } from "../hooks/use-reviews";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@fe/components/ui/alert-dialog";
import { Button } from "@fe/components/ui/button";

interface ReviewListProps {
  reviews: ReviewItem[];
  currentUserId?: string | number;
  courseId: string | number;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  currentUserId,
  courseId,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const deleteMutation = useDeleteReview(courseId);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-10 bg-muted rounded-2xl border border-dashed border-border">
        <p className="text-muted-foreground font-medium text-sm">
          Chưa có đánh giá nào cho khóa học này.
        </p>
      </div>
    );
  }

  const confirmDelete = async () => {
    if (!deletingReviewId) return;
    try {
      await deleteMutation.mutateAsync(deletingReviewId);
    } finally {
      setDeletingReviewId(null);
    }
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isOwner =
          currentUserId && String(currentUserId) === String(review.userId);
        const avatar = (review.user as any)?.profile?.avatarUrl || review.user?.avatarUrl || (review.user as any)?.avatar;
        const name = review.user?.name || review.user?.email || "Học viên";
        const dateFormatted = review.createdAt
          ? new Date(review.createdAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "";

        return (
          <div
            key={review.id}
            className="bg-card rounded-2xl p-4 md:p-5 border border-border shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_24px_rgba(15,23,42,0.09)] transition-shadow space-y-3"
          >
            {/* Header: User Avatar, Name, Rating Stars, Date, Delete button */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center text-amber-400 gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{dateFormatted}</span>
                  </div>
                </div>
              </div>

              {isOwner && (
                <button
                  onClick={() => setDeletingReviewId(review.id)}
                  disabled={deleteMutation.isPending}
                  className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Xóa đánh giá"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Comment Content */}
            {review.comment && (
              <p className="text-sm text-muted-foreground leading-relaxed font-normal whitespace-pre-line">
                {review.comment}
              </p>
            )}

            {/* Review Image Gallery */}
            {review.images && review.images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-0.5">
                {review.images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border border-border hover:opacity-95 hover:ring-2 hover:ring-piemind-pink transition-all group shrink-0 cursor-pointer"
                  >
                    <img
                      src={img.imageUrl}
                      alt="Review attachment"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingReviewId} onOpenChange={(open) => !open && setDeletingReviewId(null)}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-2.5 rounded-full bg-destructive/10 text-destructive">
                <TriangleAlert className="h-5 w-5" />
              </div>
              <div>
                <AlertDialogTitle className="text-base font-bold text-foreground">Xóa đánh giá</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground mt-1">
                  Bạn có chắc chắn muốn xóa đánh giá này không? Thao tác này không thể hoàn tác.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 flex justify-end gap-3">
            <AlertDialogClose
              render={
                <Button variant="outline" onClick={() => setDeletingReviewId(null)} className="cursor-pointer">
                  Hủy
                </Button>
              }
            />
            <Button
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white font-semibold cursor-pointer border-0"
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa đánh giá"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      {/* Lightbox Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-1 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged review attachment"
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
