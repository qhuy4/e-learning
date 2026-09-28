import { DataTable } from "@/components/common/data-table/data-table";
import { createAchievementColumns } from "@/features/achievements/columns/achievement-columns";
import { useMyAchievements } from "@/features/achievements/hooks/use-achievements";
import { useState } from "react";

export default function AchievementsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, refetch } = useMyAchievements();

  const achievements = data?.data ?? [];
  const columns = createAchievementColumns();

  return (
    <div className="space-y-6 mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thành tựu</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Các thành tựu và huy hiệu bạn đã đạt được
        </p>
      </div>

      <DataTable
        columns={columns}
        data={achievements}
        page={page}
        pageSize={pageSize}
        totalPages={Math.ceil(achievements.length / pageSize)}
        onPageChange={setPage}
        onPageSizeChange={(v) => {
          setPageSize(v);
          setPage(1);
        }}
        loading={isLoading}
        refetch={refetch}
        isFetching={isFetching}
        text={{
          searchPlaceholder: "Tìm thành tựu...",
          noResults: "Bạn chưa đạt thành tựu nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
