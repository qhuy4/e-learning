import type { ColumnDef } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/components/common/data-table/data-table-features";
import type { Certificate } from "../types/certificate";
import { CERTIFICATE_STATUS } from "../types/certificate";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export function createCertificateColumns(
  onDelete: (id: number) => void
): ColumnDef<DataTableFeatures, Certificate>[] {
  return [
    {
      accessorKey: "certificateName",
      header: "Tên chứng chỉ",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.certificateName}</span>
      ),
    },
    {
      accessorKey: "issuer",
      header: "Nhà cung cấp",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.issuer || "—"}
        </span>
      ),
    },
    {
      accessorKey: "issuedAt",
      header: "Ngày cấp",
      cell: ({ row }) => (
        <span className="text-sm">{formatDate(row.original.issuedAt)}</span>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: "Hết hạn",
      cell: ({ row }) => (
        <span className="text-sm">{formatDate(row.original.expiresAt)}</span>
      ),
    },
    {
      accessorKey: "certificateStatus",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status =
          CERTIFICATE_STATUS[
            row.original.certificateStatus as keyof typeof CERTIFICATE_STATUS
          ];
        return (
          <Badge variant={status?.variant} className={`${status?.className} border-0`}>
            {status?.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const cert = row.original;
        return (
          <div className="flex items-center gap-1">
            {cert.filePath && (
              <Button
                variant="ghost"
                size="icon"
                render={
                  <a
                    href={cert.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                title="Xem file"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            {cert.certificateStatus === 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onDelete(cert.id); }}
                className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                title="Xóa"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
