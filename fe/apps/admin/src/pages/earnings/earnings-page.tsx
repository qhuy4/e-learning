import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { useRevenueSplits, usePayouts, useRevenueSummary } from "@/features/earnings/hooks/use-earnings";
import { createRevenueSplitColumns } from "@/features/earnings/components/revenue-columns";
import { createPayoutColumns } from "@/features/earnings/components/payout-columns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@fe/components/ui/tabs";
import { formatCurrency } from "@/features/earnings/types/earnings";

export default function EarningsPage() {
  const [activeTab, setActiveTab] = useState("revenue");
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Doanh thu</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý doanh thu và lịch sử thanh toán của giảng viên
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">Doanh thu theo khóa</TabsTrigger>
          <TabsTrigger value="payouts">Lịch sử thanh toán</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <RevenueSplitTab />
        </TabsContent>

        <TabsContent value="payouts">
          <PayoutTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RevenueSplitTab() {
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

  const { data, isLoading, refetch, isFetching } = useRevenueSplits(
    page,
    limit,
    undefined,
    undefined,
    undefined,
    sortBy,
    sortOrder,
  );

  const { data: summary } = useRevenueSummary();

  const splits = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;
  const columns = createRevenueSplitColumns();

  return (
    <>
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalGross)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Platform fee</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalPlatformFee)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Giảng viên nhận</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalInstructorAmount)}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Chờ thanh toán</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.pendingCount}</p>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={splits}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/courses/${row.course?.id ?? row.id}`)}
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
          searchPlaceholder: "Tìm kiếm doanh thu...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có doanh thu nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </>
  );
}

function PayoutTab() {
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

  const { data, isLoading, refetch, isFetching } = usePayouts(
    page,
    limit,
    undefined,
    undefined,
    sortBy,
    sortOrder,
  );

  const payouts = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;
  const columns = createPayoutColumns();

  return (
    <DataTable
      columns={columns}
      data={payouts}
      page={page}
      totalPages={totalPages}
      loading={isLoading}
      isFetching={isFetching}
      refetch={refetch}
      pageSize={limit}
      onPageChange={setPage}
      onRowClick={(row) => navigate(`/earnings/payouts/${row.id}`)}
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
        searchPlaceholder: "Tìm kiếm thanh toán...",
        reload: "Tải lại",
        rowsPerPage: "Dòng trên trang",
        noResults: "Không có lịch sử thanh toán nào.",
        pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
        previous: "Trước",
        next: "Sau",
      }}
    />
  );
}
