import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { useAchievements } from "@/features/achievements/hooks/use-achievements";
import { achievementColumns } from "@/features/achievements/components/achievement-columns";
import { achievementCriteriaLabel } from "@/features/achievements/types/achievement";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fe/components/ui/select";

const criteriaOptions = Object.entries(achievementCriteriaLabel).map(([value, label]) => ({
  value,
  label,
}));

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } = useListPage();
  const [criteriaFilter, setCriteriaFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, refetch, isFetching } = useAchievements(
    page,
    limit,
    debouncedSearch || undefined,
    criteriaFilter || undefined,
    statusFilter === "true" ? true : statusFilter === "false" ? false : undefined,
  );

  const achievements = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Thành tựu</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý thành tựu và huy hiệu cho học viên
        </p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Select
          value={criteriaFilter}
          onValueChange={(v) => {
            setCriteriaFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue>
              {criteriaFilter
                ? criteriaOptions.find((o) => o.value === criteriaFilter)?.label
                : "Tất cả tiêu chí"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tiêu chí</SelectItem>
            {criteriaOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue>
              {statusFilter === "true"
                ? "Kích hoạt"
                : statusFilter === "false"
                  ? "Tạm dừng"
                  : "Tất cả trạng thái"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="true">Kích hoạt</SelectItem>
            <SelectItem value="false">Tạm dừng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={achievementColumns}
        data={achievements}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/achievements/${row.id}`)}
        search={search}
        onSearchChange={setSearch}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        text={{
          searchPlaceholder: "Tìm tên thành tựu...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có thành tựu nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
