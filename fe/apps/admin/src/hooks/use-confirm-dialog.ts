import { useState, useCallback } from "react";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve?: (value: boolean) => void;
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmState>({ open: false });

  const confirm = useCallback((options: ConfirmOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        resolve,
        title: options.title ?? "Xác nhận",
        description: options.description ?? "Bạn có chắc chắn muốn thực hiện thao tác này?",
        confirmLabel: options.confirmLabel ?? "Xác nhận",
        cancelLabel: options.cancelLabel ?? "Hủy",
        variant: options.variant ?? "danger",
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState((prev) => {
      prev.resolve?.(true);
      return { open: false };
    });
  }, []);

  const handleCancel = useCallback(() => {
    setState((prev) => {
      prev.resolve?.(false);
      return { open: false };
    });
  }, []);

  return { confirm, confirmState: state, handleConfirm, handleCancel };
}
