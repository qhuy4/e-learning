import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Separator } from "@fe/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";
import { useCreateCategory, useCategories } from "@/features/categories/hooks/use-category";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
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

export default function CategoryCreatePage() {
  const navigate = useNavigate();
  const createCategory = useCreateCategory();
  const { data: parentData } = useCategories(1, 100, undefined, null, true);
  const parents = parentData?.data ?? [];

  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentId: null as number | null,
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

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

    const tid = toast.loading("Đang tạo danh mục...");
    try {
      await createCategory.mutateAsync({
        name: form.name.trim(),
        slug: form.slug.trim(),
        parentId: form.parentId,
      });
      toast.success("Tạo danh mục thành công!", { id: tid });
      navigate("/categories");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  return (
    <div className="p-6 mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/categories")} className="-ml-2">
        <ArrowLeft className="size-4" />
        Quay lại danh sách
      </Button>

      <Section title="Tạo danh mục mới">
        <p className="text-sm text-muted-foreground -mt-2">Nhập thông tin để tạo danh mục mới.</p>

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
              onClick={() => navigate("/categories")}
              disabled={createCategory.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="outline" disabled={createCategory.isPending}>
              {createCategory.isPending ? "Đang tạo..." : "Tạo danh mục"}
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
