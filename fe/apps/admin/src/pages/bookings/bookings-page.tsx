import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { useBookings } from "@/features/bookings/hooks/use-bookings";
import { bookingColumns } from "@/features/bookings/components/booking-columns";
import { bookingStatusLabel, type BookingStatus } from "@/features/bookings/types/booking";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fe/components/ui/select";

const statusOptions = Object.entries(bookingStatusLabel).map(([value, label]) => ({
  value,
  label,
}));

export default function BookingsPage() {
  const navigate = useNavigate();
  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } = useListPage();
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, refetch, isFetching } = useBookings(
    page,
    limit,
    {
      keyword: debouncedSearch || undefined,
      status: statusFilter ? parseInt(statusFilter, 10) : undefined,
    },
  );

  const bookings = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Đặt lịch</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý buổi đặt lịch giữa học viên và giảng viên
        </p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue>
              {statusFilter
                ? bookingStatusLabel[parseInt(statusFilter, 10) as BookingStatus]
                : "Tất cả trạng thái"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={bookingColumns}
        data={bookings}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/bookings/${row.id}`)}
        search={search}
        onSearchChange={setSearch}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        text={{
          searchPlaceholder: "Tìm tên học viên, giảng viên...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có buổi đặt lịch nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
