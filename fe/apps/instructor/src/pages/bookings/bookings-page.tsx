import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@fe/components/ui/select";
import { DataTable } from "@/components/common/data-table/data-table";
import { useBookings } from "@/features/bookings/hooks/use-bookings";
import { createBookingColumns } from "@/features/bookings/columns/booking-columns";
import { BOOKING_STATUS_LABELS } from "@/features/bookings/types/booking";

const STATUS_OPTIONS = Object.entries(BOOKING_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export default function BookingsPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, refetch } = useBookings({
    page,
    limit: pageSize,
    keyword: keyword || undefined,
    status: status !== "" ? Number(status) : undefined,
  });

  const bookings = data?.data ?? [];
  const meta = data?.meta;
  const columns = createBookingColumns();

  return (
    <div className="space-y-6 mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đặt lịch</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Danh sách buổi đặt lịch của bạn
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Select
          value={status || "all"}
          onValueChange={(v) => {
            setStatus(v && v !== "all" ? v : "");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 min-w-[160px]">
            {status !== ""
              ? (BOOKING_STATUS_LABELS[Number(status)] ?? "Tất cả trạng thái")
              : "Tất cả trạng thái"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        page={page}
        pageSize={pageSize}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={setPage}
        loading={isLoading}
        refetch={refetch}
        isFetching={isFetching}
        search={keyword}
        onSearchChange={(v) => {
          setKeyword(v);
          setPage(1);
        }}
        onPageSizeChange={(v) => {
          setPageSize(v);
          setPage(1);
        }}
        onRowClick={(row) => navigate(`/bookings/${row.id}`)}
        text={{
          searchPlaceholder: "Tìm theo tên học viên...",
          noResults: "Chưa có buổi đặt lịch nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
