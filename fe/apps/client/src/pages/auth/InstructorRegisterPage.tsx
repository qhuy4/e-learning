import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { instructorService } from "@/features/instructor/services/instructor.service";

export const InstructorRegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionToken = searchParams.get("session") || "";
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionToken) {
      setVerifying(false);
      setErrorMessage("Không tìm thấy mã session đăng ký. Vui lòng mở lại link từ email.");
      return;
    }

    const checkSession = async () => {
      try {
        const data = await instructorService.verifySession(sessionToken);
        setEmail(data.email);
      } catch (err: any) {
        setErrorMessage(
          err.response?.data?.error?.message ||
            err.response?.data?.message ||
            err.message ||
            "Session đăng ký không hợp lệ hoặc đã hết hạn.",
        );
      } finally {
        setVerifying(false);
      }
    };

    checkSession();
  }, [sessionToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await instructorService.register({
        session: sessionToken,
        name,
        password,
      });

      if (res.accessToken) {
        localStorage.setItem("accessToken", res.accessToken);
      }

      // Điều hướng sang trang định danh eKYC & hoàn tất hồ sơ
      navigate("/instructor/kyc");
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Đăng ký thất bại. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Đang xác thực liên kết đăng ký...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full mb-3">
          Bước 1: Khởi tạo tài khoản
        </span>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Hoàn tất Đăng Ký Giảng Viên
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Tài khoản của bạn sẽ được gán quyền <strong>Giảng viên (Instructor)</strong>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl sm:px-10 border border-gray-200">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {errorMessage}
            </div>
          )}

          {!email && !errorMessage ? (
            <div className="text-center py-4">
              <p className="text-red-600 font-medium">Session không hợp lệ.</p>
              <a
                href="/teach"
                className="mt-4 inline-block text-indigo-600 text-sm font-semibold hover:underline"
              >
                ← Quay lại trang đăng ký
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email xác nhận
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên hiển thị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 mt-2 disabled:opacity-50"
              >
                {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản Giảng viên"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
