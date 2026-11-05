import React, { useState, useEffect } from "react";
import { Star, X, Loader2, CheckCircle, ImagePlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useCreateOrUpdateReview } from "../hooks/use-reviews";
import type { ReviewItem } from "../types/review.type";

interface LocalImagePreview {
  file?: File;
  url: string;
  isExisting?: boolean;
}

interface ReviewFormModalProps {
  courseId: string | number;
  isOpen: boolean;
  onClose: () => void;
  existingReview?: ReviewItem | null;
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  courseId,
  isOpen,
  onClose,
  existingReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [images, setImages] = useState<LocalImagePreview[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createOrUpdateMutation = useCreateOrUpdateReview(courseId);

  // 100% Bulletproof Cross-Browser Background Scroll Locking
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      const prevBodyOverflow = document.body.style.overflow;
      const prevBodyPosition = document.body.style.position;
      const prevBodyTop = document.body.style.top;
      const prevBodyWidth = document.body.style.width;
      const prevHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.body.style.position = prevBodyPosition;
        document.body.style.top = prevBodyTop;
        document.body.style.width = prevBodyWidth;
        document.documentElement.style.overflow = prevHtmlOverflow;
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || "");
      const existingImgs: LocalImagePreview[] = (existingReview.images || []).map((img) => ({
        url: img.imageUrl,
        isExisting: true,
      }));
      setImages(existingImgs);
    } else {
      setRating(5);
      setComment("");
      setImages([]);
    }
    setErrorMessage(null);
  }, [existingReview, isOpen]);

  if (!isOpen) return null;

  // Local file selection (preview only, no server upload yet!)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setErrorMessage(null);
    const newPreviews: LocalImagePreview[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.size > 5 * 1024 * 1024) {
        const msg = `File "${file.name}" vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.`;
        setErrorMessage(msg);
        toast.error(msg);
        continue;
      }
      if (images.length + newPreviews.length >= 5) {
        const msg = "Bạn chỉ được chọn tối đa 5 hình ảnh.";
        setErrorMessage(msg);
        toast.error(msg);
        break;
      }

      newPreviews.push({
        file,
        url: URL.createObjectURL(file),
        isExisting: false,
      });
    }

    setImages((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const target = prev[index];
      if (target.file) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Submit rating, comment AND image files in 1 SINGLE API REQUEST!
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (rating < 1 || rating > 5) {
      const msg = "Vui lòng chọn từ 1 đến 5 sao đánh giá";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const filesToUpload = images.filter((img) => !img.isExisting && img.file).map((img) => img.file!);
    const existingUrls = images.filter((img) => img.isExisting).map((img) => img.url);

    try {
      await createOrUpdateMutation.mutateAsync({
        rating,
        comment,
        files: filesToUpload,
        existingImageUrls: existingUrls,
      });

      const successMsg = existingReview
        ? "Cập nhật đánh giá thành công!"
        : "Gửi đánh giá khóa học thành công!";

      toast.success(successMsg);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể lưu đánh giá. Vui lòng thử lại sau.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const starLabels: Record<number, { text: string; bg: string; textCol: string }> = {
    5: { text: "Rất tuyệt vời - Rất hài lòng", bg: "bg-emerald-50 border-emerald-200", textCol: "text-emerald-700" },
    4: { text: "Khóa học chất lượng tốt", bg: "bg-blue-50 border-blue-200", textCol: "text-blue-700" },
    3: { text: "Bình thường - Cần cải thiện", bg: "bg-amber-50 border-amber-200", textCol: "text-amber-700" },
    2: { text: "Chưa như kỳ vọng", bg: "bg-orange-50 border-orange-200", textCol: "text-orange-700" },
    1: { text: "Không hài lòng", bg: "bg-rose-50 border-rose-200", textCol: "text-rose-700" },
  };

  const currentActiveStar = hoverRating || rating;
  const currentLabel = starLabels[currentActiveStar] || starLabels[5];

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Modal Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-card rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-border z-10 my-auto max-h-[90vh] flex flex-col transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean Light Header Bar */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card shrink-0">
          <div>
            <h3 className="text-base font-extrabold text-foreground tracking-tight">
              {existingReview ? "Chỉnh sửa đánh giá của bạn" : "Viết đánh giá khóa học"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chia sẻ trải nghiệm học tập thực tế để giúp giảng viên và cộng đồng học viên.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-84px)]">
          {errorMessage && (
            <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Interactive Star Rating Selector */}
          <div className="flex flex-col items-center justify-center p-5 bg-piemind-pink/5 rounded-2xl border border-piemind-pink/15 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Đánh giá chung của bạn về khóa học
            </span>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= currentActiveStar;
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors duration-150 ${
                        active
                          ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                          : "text-muted-foreground/40 hover:text-amber-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div
              className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${currentLabel.bg} ${currentLabel.textCol}`}
            >
              {currentLabel.text}
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Nội dung đánh giá chi tiết
              </label>
              <span className="text-[11px] text-muted-foreground font-medium">
                {comment.length} / 1000 ký tự
              </span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              placeholder="Nhập cảm nhận của bạn về nội dung bài giảng, cách truyền đạt của giảng viên hoặc kiến thức thực tế thu nhận được..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-piemind-pink/40 focus:border-piemind-pink text-sm text-foreground placeholder:text-muted-foreground bg-card transition-all"
            />
          </div>

          {/* Review Image Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Hình ảnh đính kèm ({images.length}/5)
              </label>
              <span className="text-[11px] text-muted-foreground font-medium">Gửi kèm cùng bài đánh giá</span>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl overflow-hidden border border-border shadow-2xs group bg-muted"
                >
                  <img src={img.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-slate-900/80 hover:bg-rose-600 text-white p-1 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {!img.isExisting && (
                    <span className="absolute bottom-1 left-1 bg-piemind-pink text-[9px] text-white font-bold px-1.5 py-0.5 rounded-md">
                      Mới
                    </span>
                  )}
                </div>
              ))}

              {images.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-border hover:border-piemind-pink rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-piemind-pink/5 text-muted-foreground hover:text-piemind-pink group">
                  <ImagePlus className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold">Thêm ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={createOrUpdateMutation.isPending}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={createOrUpdateMutation.isPending}
              className="px-5 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={createOrUpdateMutation.isPending}
              className="px-6 py-2.5 text-xs font-bold text-white bg-piemind-pink hover:bg-piemind-pink/90 disabled:bg-slate-400 rounded-xl shadow-[0_4px_16px_rgba(243,129,129,0.3)] transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              {createOrUpdateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải ảnh & Gửi...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{existingReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
