import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { useCoupons } from "@/features/coupons/hooks/use-coupon";
import { createCouponColumns } from "@/features/coupons/components/coupon-columns";
import { Button } from "@fe/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function CouponsPage() {
  const navigate = useNavigate();
  const {
    page,
    limit,
    search,
    debouncedSearch,
    sortBy,
    sortOrder,
    setPage,
    setLimit,
    setSearch,
    handleSortChange,
  } = useListPage();

  const { data, isLoading, refetch, isFetching } = useCoupons(
    page,
    limit,
    debouncedSearch || undefined,
    sortBy,
    sortOrder,
  );

  const coupons = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;
  const columns = createCouponColumns();

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mã giảm giá</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý mã giảm giá cho hệ thống</p>
        </div>
        <Button asChild>
          <Link to="/coupons/create">
            <Plus className="mr-2 h-4 w-4" />
            Tạo mã giảm giá
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/coupons/${row.id}`)}
        search={search}
        onSearchChange={setSearch}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        text={{
          searchPlaceholder: "Tìm kiếm mã giảm giá...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có mã giảm giá nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
