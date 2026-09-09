import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { useAdminOrders } from "@/features/orders/hooks/use-admin-order";
import { createOrderColumns } from "@/features/orders/components/order-columns";

export default function OrdersPage() {
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

  const { data, isLoading, refetch, isFetching } = useAdminOrders(
    page,
    limit,
    debouncedSearch || undefined,
    sortBy,
    sortOrder,
  );

  const orders = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;
  const columns = createOrderColumns();

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">Danh sách tất cả đơn hàng trên nền tảng</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/orders/${row.id}`)}
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
          searchPlaceholder: "Tìm kiếm mã đơn, tên học viên...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có đơn hàng nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
