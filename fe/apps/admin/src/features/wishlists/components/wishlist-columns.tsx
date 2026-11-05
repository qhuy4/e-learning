import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/components/common/data-table/data-table-features";
import type { Wishlist } from "../types/wishlist";

const column = createColumnHelper<DataTableFeatures, Wishlist>();

export const wishlistColumns = [
  column.accessor("user", {
    header: "Học viên",
    cell: (info) => info.getValue()?.name || "—",
  }),
  column.accessor("name", {
    header: "Tên danh sách",
    cell: (info) => info.getValue() || "—",
  }),
  column.accessor("itemCount", {
    header: "Số khóa học",
    cell: (info) => info.getValue() ?? 0,
  }),
  column.accessor("isDefault", {
    header: "Mặc định",
    cell: (info) => (info.getValue() ? "Có" : "Không"),
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
