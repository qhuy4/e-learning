import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Separator } from "@fe/components/ui/separator";
import { useCategory, useDeleteCategory } from "@/features/categories/hooks/use-category";

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="px-6 py-4 border-b">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div>{children}</div>
    </div>
  );
}

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: category, isLoading } = useCategory(id!);
  const deleteCategory = useDeleteCategory();

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này? Danh mục con sẽ được chuyển lên danh mục cha.")) return;
    const tid = toast.loading("Đang xóa danh mục...");
    try {
      await deleteCategory.mutateAsync(id!);
      toast.success("Xóa danh mục thành công!", { id: tid });
      navigate("/categories");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-6">
        <p>Không tìm thấy danh mục</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="ghost" className="mb-4" onClick={() => navigate("/categories")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            <span className="font-mono">/{category.slug}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/categories/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Thông tin danh mục">
          <Field label="Tên danh mục">
            <p className="font-medium">{category.name}</p>
          </Field>
          <Field label="Đường dẫn">
            <p className="font-mono text-sm">/{category.slug}</p>
          </Field>
          <Separator />
          <Field label="Danh mục cha">
            <p>{category.parentId ? `#${category.parentId}` : "Danh mục gốc"}</p>
          </Field>
          <Field label="Số khóa học">
            <p>{category.courseCount ?? 0}</p>
          </Field>
        </Section>

        <div className="space-y-6">
          <Section title="Thời gian">
            <Field label="Ngày tạo">
              <p>{formatDate(category.createdAt)}</p>
            </Field>
            <Field label="Cập nhật lần cuối">
              <p>{formatDate(category.updatedAt)}</p>
            </Field>
          </Section>

          {category.children && category.children.length > 0 && (
            <Section title={`Danh mục con (${category.children.length})`}>
              <div className="space-y-2">
                {category.children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/categories/${child.id}`)}
                  >
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">/{child.slug}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{child.courseCount ?? 0} khóa học</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
