import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@fe/components/ui/badge";
import type { InstructorCertificate } from "../types/instructor-certificate";
import {
  instructorCertificateStatusLabel,
  instructorCertificateStatusClassName,
} from "../types/instructor-certificate";

const column = createColumnHelper<InstructorCertificate>();

export const instructorCertificateColumns = [
  column.accessor("certificateName", {
    header: "Tên chứng chỉ",
    cell: (info) => info.getValue() || "—",
  }),
  column.accessor("issuer", {
    header: "Viện cấp",
    cell: (info) => info.getValue() || "—",
  }),
  column.accessor("user", {
    header: "Giảng viên",
    cell: (info) => info.getValue()?.name || "—",
  }),
  column.accessor("certificateStatus", {
    header: "Trạng thái",
    cell: (info) => {
      const status = info.getValue() as keyof typeof instructorCertificateStatusLabel;
      const label = instructorCertificateStatusLabel[status];
      const className = instructorCertificateStatusClassName[status];
      return <Badge variant="outline" className={className}>{label}</Badge>;
    },
  }),
  column.accessor("createdAt", {
    header: "Ngày tạo",
    cell: (info) => {
      const v = info.getValue();
      if (!v) return "—";
      return new Date(v).toLocaleDateString("vi-VN");
    },
  }),
];
