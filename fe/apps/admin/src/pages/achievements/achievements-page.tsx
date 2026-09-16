import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { useAchievements } from "@/features/achievements/hooks/use-achievements";
import { achievementColumns } from "@/features/achievements/components/achievement-columns";

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } = useListPage();

  const { data, isLoading, refetch, isFetching } = useAchievements(
    page,
    limit,
    debouncedSearch || undefined,
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
