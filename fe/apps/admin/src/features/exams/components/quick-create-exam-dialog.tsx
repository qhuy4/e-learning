import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@fe/components/ui/button";
import { Checkbox } from "@fe/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fe/components/ui/dialog";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";
import { useCreateExam } from "../hooks/use-exams";
import { useExamFormats, useExamFormatSections } from "../hooks/use-exam-formats";

interface QuickCreateExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Tạo đề nhanh 1 bước: chọn định dạng (tự sinh part + số câu theo
 * exam_format_sections) → tạo đề → vào thẳng trang Import ZIP, nơi template
 * (Excel + thư mục media) đã được scaffold sẵn theo part.
 */
export function QuickCreateExamDialog({ open, onOpenChange }: QuickCreateExamDialogProps) {
  const navigate = useNavigate();
  const createExam = useCreateExam();
  const { data: formats = [] } = useExamFormats();

  const [formatId, setFormatId] = useState("");
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState<number | "">("");
  const [isPremium, setIsPremium] = useState(false);

  const selectedFormat = formats.find((f) => String(f.id) === formatId);
  const { data: formatSections } = useExamFormatSections(Number(formatId) || 0);
  const hasSections = (formatSections?.length ?? 0) > 0;

  // Đổi định dạng → dùng thời lượng mặc định của định dạng đó (primitive dep:
  // refetch cùng dữ liệu không ghi đè phần người dùng đã sửa).
  const defaultMinutes = selectedFormat?.durationSeconds
    ? Math.round(selectedFormat.durationSeconds / 60)
    : "";
  useEffect(() => {
    setMinutes(defaultMinutes);
  }, [defaultMinutes]);

  const reset = () => {
    setFormatId("");
    setTitle("");
    setIsPremium(false);
  };

  const handleSubmit = async () => {
    if (!formatId) {
      toast.error("Chọn định dạng đề thi.");
      return;
    }
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Nhập tên đề thi.");
      return;
    }
    const tid = toast.loading("Đang tạo đề thi...");
    try {
      const created = await createExam.mutateAsync({
        examFormatId: Number(formatId),
        title: trimmedTitle,
        isPremium,
        durationSeconds: minutes === "" ? undefined : Math.max(1, Math.round(minutes)) * 60,
      });
      const straightToImport = hasSections;
      toast.success(
        straightToImport ? "Đã tạo đề — mở trang Import ZIP." : "Tạo đề thi thành công!",
        { id: tid },
      );
      onOpenChange(false);
      reset();
      navigate(
        created?.id
          ? straightToImport
            ? `/exams/${created.id}/import-package`
            : `/exams/${created.id}`
          : "/exams",
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Có lỗi xảy ra", { id: tid });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <Zap className="size-4 text-primary" />
            Tạo đề nhanh
          </DialogTitle>
          <DialogDescription>
            Chọn định dạng là xong — hệ thống tự sinh các phần thi (part + số câu) theo định dạng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Định dạng đề thi</Label>
            <Select
              items={Object.fromEntries(formats.map((f) => [String(f.id), f.name]))}
              value={formatId}
              onValueChange={(v) => setFormatId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn định dạng" />
              </SelectTrigger>
              <SelectContent>
                {formats.map((format) => (
                  <SelectItem key={format.id} value={String(format.id)}>
                    {format.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formatId && formatSections && (
              <p className="text-xs text-muted-foreground">
                {hasSections ? (
                  <>
                    Tự sinh {formatSections.length} phần thi:{" "}
                    {formatSections
                      .slice()
                      .sort((a, b) => a.position - b.position)
                      .map((s) => `${s.name} · ${s.questionCount ?? "?"} câu`)
                      .join(" + ")}
                  </>
                ) : (
                  <span className="text-amber-600">
                    Định dạng này chưa có cấu trúc phần thi — đề sẽ chưa có phần thi để nhập câu hỏi.
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quick-exam-title">Tên đề thi</Label>
            <Input
              id="quick-exam-title"
              value={title}
              placeholder="VD: Đề TOEIC thử 02"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quick-exam-minutes">Thời lượng (phút)</Label>
            <Input
              id="quick-exam-minutes"
              type="number"
              min={1}
              value={minutes}
              placeholder="Theo định dạng"
              onChange={(e) => {
                const raw = e.target.value;
                const n = Number(raw);
                setMinutes(raw === "" || Number.isNaN(n) ? "" : n);
              }}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Checkbox
                id="quick-exam-premium"
                checked={isPremium}
                onCheckedChange={(checked) => setIsPremium(!!checked)}
              />
              <label className="text-sm font-medium" htmlFor="quick-exam-premium">
                Premium (trả phí)
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={createExam.isPending}>
            <Zap className="mr-1.5 size-4" />
            {createExam.isPending ? "Đang tạo…" : "Tạo đề"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
