export interface Certificate {
  id: number;
  certificateName: string;
  issuer: string | null;
  filePath: string;
  issuedAt: string | null;
  expiresAt: string | null;
  certificateStatus: number;
  rejectReason: string | null;
  createdAt: string;
}

export const CERTIFICATE_STATUS: Record<
  number,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  1: { label: "Đang chờ", variant: "outline", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  2: { label: "Đã duyệt", variant: "default", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  3: { label: "Bị từ chối", variant: "destructive", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};
