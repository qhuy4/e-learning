import { TriangleAlert } from "lucide-react";
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

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = "Xác nhận",
  description = "Bạn có chắc chắn muốn thực hiện thao tác này?",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            {variant === "danger" && (
              <div className="shrink-0 p-2 rounded-full bg-destructive/10">
                <TriangleAlert className="h-5 w-5 text-destructive" />
              </div>
            )}
            <div>
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogClose
            render={
              <Button variant="outline" onClick={onCancel}>
                {cancelLabel}
              </Button>
            }
          />
          <Button
            onClick={onConfirm}
            className={
              variant === "danger"
                ? "bg-destructive hover:bg-destructive/90 text-white border-0"
                : ""
            }
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
