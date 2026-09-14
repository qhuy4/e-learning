import { createColumnHelper } from "@tanstack/react-table";
import type { Certificate } from "../types/student-certificate";

const column = createColumnHelper<Certificate>();

export const studentCertificateColumns = [
  column.accessor("user", {
    header: "Học viên",
    cell: (info) => info.getValue()?.name || "—",
  }),
  column.accessor("course", {
    header: "Khóa học",
    cell: (info) => info.getValue()?.title || "—",
  }),
  column.accessor("certCode", {
    header: "Mã chứng chỉ",
    cell: (info) => {
      const v = info.getValue();
      if (!v) return "—";
      return v.substring(0, 8) + "...";
    },
  }),
  column.accessor("issuedAt", {
    header: "Ngày cấp",
    cell: (info) => {
      const v = info.getValue();
      if (!v) return "—";
      return new Date(v).toLocaleDateString("vi-VN");
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
