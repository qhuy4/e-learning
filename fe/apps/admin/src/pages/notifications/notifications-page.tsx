import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { useNotifications, useMarkAllAsRead } from "@/features/notifications/hooks/use-notifications";
import { notificationColumns, typeLabels } from "@/features/notifications/components/notification-columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fe/components/ui/select";
import { Button } from "@fe/components/ui/button";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";

const readOptions = [
  { value: "all", label: "Tất cả" },
  { value: "unread", label: "Chưa đọc" },
  { value: "read", label: "Đã đọc" },
];

const typeOptions = [
  { value: "all", label: "Tất cả" },
  ...Object.entries(typeLabels).map(([value, label]) => ({ value, label })),
];

export function NotificationsPage() {
  const navigate = useNavigate();
  const {
    page,
    limit,
    search,
    debouncedSearch,
    setPage,
    setLimit,
    setSearch,
  } = useListPage();

  const [readFilter, setReadFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const markAllAsReadMutation = useMarkAllAsRead();

  const { data, isLoading, refetch, isFetching } = useNotifications(
    page,
    limit,
    typeFilter !== "all" ? typeFilter : undefined,
    readFilter === "unread" ? false : readFilter === "read" ? true : undefined,
    debouncedSearch || undefined,
  );

  const notifications = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;

  const handleMarkAllRead = () => {
    markAllAsReadMutation.mutate(undefined, {
      onSuccess: () => toast.success("Đã đánh dấu tất cả là đã đọc"),
      onError: () => toast.error("Không thể đánh dấu đã đọc"),
    });
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Thông báo</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý thông báo hệ thống</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllRead} disabled={markAllAsReadMutation.isPending}>
          <CheckCheck className="h-4 w-4 mr-1" />
          Đọc tất cả
        </Button>
      </div>

      <div className="mb-4 flex gap-3">
        <Select value={readFilter} onValueChange={(v) => { setReadFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue>
              {readOptions.find((o) => o.value === readFilter)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {readOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue>
              {typeOptions.find((o) => o.value === typeFilter)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={notificationColumns}
        data={notifications}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/notifications/${row.id}`)}
        search={search}
        onSearchChange={setSearch}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        text={{
          searchPlaceholder: "Tìm tiêu đề, nội dung...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có thông báo nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
