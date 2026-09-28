import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ChevronLeft, Save } from "lucide-react";
import { useCreateCertificate } from "@/features/certificates/hook/use-certificates";
import { getErrorMessage } from "@/shared/utils/error";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Separator } from "@fe/components/ui/separator";
import { Calendar } from "@fe/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@fe/components/ui/popover";
import { formatDate } from "date-fns";
import { vi } from "date-fns/locale";

export default function CertificateCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateCertificate();
  const [form, setForm] = useState({
    certificateName: "",
    issuer: "",
    issuedAt: null as Date | null,
    expiresAt: null as Date | null,
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!form.certificateName || !file) return;
    const tid = toast.loading("Đang tạo chứng chỉ...");
    createMutation.mutate(
      {
        certificateName: form.certificateName,
        issuer: form.issuer || undefined,
        issuedAt: form.issuedAt ? form.issuedAt.toISOString() : undefined,
        expiresAt: form.expiresAt ? form.expiresAt.toISOString() : undefined,
        file,
      },
      {
        onSuccess: () => {
          toast.success("Đã tạo chứng chỉ thành công!", { id: tid });
          navigate("/certificates");
        },
        onError: (err) => {
          toast.error(getErrorMessage(err), { id: tid });
        },
      }
    );
  };

  return (
    <div className="space-y-6  mx-auto p-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/certificates")}
          className="rounded-md hover:bg-muted shrink-0 h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Thêm chứng chỉ mới</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Điền thông tin và tải lên file chứng chỉ
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chứng chỉ</CardTitle>
          <CardDescription>Nhập thông tin chứng chỉ bạn muốn thêm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificateName">
              Tên chứng chỉ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="certificateName"
              placeholder="VD: AWS Solutions Architect"
              value={form.certificateName}
              onChange={(e) => setForm({ ...form, certificateName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuer">Nhà cung cấp</Label>
            <Input
              id="issuer"
              placeholder="VD: Amazon, Google, Meta..."
              value={form.issuer}
              onChange={(e) => setForm({ ...form, issuer: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngày cấp</Label>
              <Popover>
                <PopoverTrigger render={<Button variant="outline" className="w-full justify-start text-left font-normal" />}>
                  {form.issuedAt
                    ? formatDate(form.issuedAt, "dd/MM/yyyy", { locale: vi })
                    : "Chọn ngày cấp"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.issuedAt}
                    onSelect={(date) => setForm({ ...form, issuedAt: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Hết hạn</Label>
              <Popover>
                <PopoverTrigger render={<Button variant="outline" className="w-full justify-start text-left font-normal" />}>
                  {form.expiresAt
                    ? formatDate(form.expiresAt, "dd/MM/yyyy", { locale: vi })
                    : "Chọn ngày hết hạn"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.expiresAt}
                    onSelect={(date) => setForm({ ...form, expiresAt: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>
              File chứng chỉ <span className="text-red-500">*</span>
            </Label>
            <Input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              Chấp nhận file ảnh (JPG, PNG, WebP) hoặc PDF. Tối đa 10MB.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!form.certificateName || !file || createMutation.isPending}
        >
          {createMutation.isPending ? "Đang tạo..." : "Tạo chứng chỉ"}
        </Button>
        <Button variant="outline" onClick={() => navigate("/certificates")}>
          Hủy
        </Button>
      </div>
    </div>
  );
}
