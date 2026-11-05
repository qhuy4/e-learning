import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { useCategories } from "@/features/categories/hooks/use-category";
import { createCategoryColumns } from "@/features/categories/components/category-columns";
import { Button } from "@fe/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function CategoriesPage() {
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

  const { data, isLoading, refetch, isFetching } = useCategories(
    page,
    limit,
    debouncedSearch || undefined,
  );

  const categories = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;
  const columns = createCategoryColumns();

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Danh mục</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý danh mục khóa học</p>
        </div>
        <Button render={<Link to="/categories/create" />}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo danh mục
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/categories/${row.id}`)}
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
          searchPlaceholder: "Tìm kiếm danh mục...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có danh mục nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
