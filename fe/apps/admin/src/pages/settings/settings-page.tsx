import { Button } from "@fe/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý cài đặt hệ thống
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Trang cài đặt đang được phát triển.
        </p>
      </div>
    </div>
  );
}
