import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Separator } from "@fe/components/ui/separator";
import { Skeleton } from "@fe/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";
import { useCategory, useUpdateCategory, useCategories } from "@/features/categories/hooks/use-category";

function PageSkeleton() {
  return (
    <div className="p-6 mx-auto space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function CategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: category, isLoading } = useCategory(id!);
  const updateCategory = useUpdateCategory();
  const { data: parentData } = useCategories(1, 100, undefined, null, true);
  const parents = (parentData?.data ?? []).filter((p) => String(p.id) !== id);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentId: null as number | null,
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
      });
    }
  }, [category]);

  const setField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug === slugify(prev.name) || prev.slug === "" ? slugify(name) : prev.slug,
    }));
    setErrors((prev) => ({ ...prev, name: undefined, slug: undefined }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Tên danh mục không được để trống";
    if (!form.slug.trim()) errs.slug = "Đường dẫn không được để trống";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const tid = toast.loading("Đang cập nhật danh mục...");
    try {
      await updateCategory.mutateAsync({
        id: id!,
        data: {
          name: form.name.trim(),
          slug: form.slug.trim(),
          parentId: form.parentId,
        },
      });
      toast.success("Cập nhật danh mục thành công!", { id: tid });
      navigate(`/categories/${id}`);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  if (isLoading) return <PageSkeleton />;

  if (!category) {
    return (
      <div className="p-6">
        <p>Không tìm thấy danh mục</p>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/categories/${id}`)} className="-ml-2">
        <ArrowLeft className="size-4" />
        Quay lại chi tiết
      </Button>

      <Section title="Chỉnh sửa danh mục">
        <p className="text-sm text-muted-foreground -mt-2">
          Cập nhật thông tin danh mục <span className="font-medium">{category.name}</span>.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="cat-name">
              Tên danh mục <span className="text-destructive">*</span>
            </label>
            <Input
              id="cat-name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: Lập trình web"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="cat-slug">
              Đường dẫn <span className="text-destructive">*</span>
            </label>
            <Input
              id="cat-slug"
              value={form.slug}
              onChange={(e) => setField("slug", e.target.value)}
              placeholder="VD: lap-trinh-web"
              className="font-mono"
              aria-invalid={!!errors.slug}
            />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Danh mục cha</label>
            <Select
              value={form.parentId != null ? String(form.parentId) : "__none__"}
              onValueChange={(v) => setField("parentId", v === "__none__" ? null : Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {form.parentId != null
                    ? parents.find((p) => String(p.id) === String(form.parentId))?.name ?? "Không xác định"
                    : "Không có danh mục cha (danh mục gốc)"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Không có danh mục cha (danh mục gốc)</SelectItem>
                {parents.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/categories/${id}`)}
              disabled={updateCategory.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="outline" disabled={updateCategory.isPending}>
              {updateCategory.isPending ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
