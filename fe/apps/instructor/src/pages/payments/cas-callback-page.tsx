import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function CasCallbackPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const publicToken = searchParams.get("publicToken");
    const state = searchParams.get("state");

    if (!publicToken) {
      setStatus("error");
      setMessage("Không tìm thấy mã xác thực. Vui lòng thử lại.");
      return;
    }

    if (window.opener) {
      window.opener.postMessage(
        { type: "CAS_LINK_SUCCESS", publicToken, state },
        window.location.origin
      );
      setStatus("success");
      setMessage("Đã xác thực thành công! Đang đóng cửa sổ...");
      setTimeout(() => window.close(), 1500);
    } else {
      setStatus("error");
      setMessage("Không thể kết nối với cửa sổ chính. Vui lòng đóng và thử lại.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-sm mx-auto p-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
            <p className="text-sm text-muted-foreground">Đang xử lý xác thực...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
            <p className="text-sm text-green-600 font-medium">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-sm text-destructive">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
