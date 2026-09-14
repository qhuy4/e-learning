import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { useWishlists } from "@/features/wishlists/hooks/use-wishlists";
import { wishlistColumns } from "@/features/wishlists/components/wishlist-columns";

export function WishlistsPage() {
  const navigate = useNavigate();
  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } = useListPage();

  const { data, isLoading, refetch, isFetching } = useWishlists(
    page,
    limit,
    debouncedSearch || undefined,
  );

  const wishlists = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Danh sách yêu thích</h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý danh sách yêu thích của học viên</p>
      </div>

      <DataTable
        columns={wishlistColumns}
        data={wishlists}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/wishlists/${row.id}`)}
        search={search}
        onSearchChange={setSearch}
        onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
        text={{
          searchPlaceholder: "Tìm học viên, tên danh sách...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có danh sách yêu thích nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
