import React, { useState } from "react";
import { instructorService } from "../services/instructor.service";

export const TeachLandingPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      await instructorService.sendInvite(email);
      setSubmitted(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full mb-3">
            Giảng dạy cùng chúng tôi
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
            Trở thành Giảng viên & Chia sẻ tri thức
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Hàng triệu học viên đang chờ đợi những khóa học chất lượng từ bạn.
            Hãy bắt đầu hành trình giảng dạy trực tuyến ngay hôm nay!
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              1
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Tự do sáng tạo</h3>
            <p className="text-sm text-gray-500">
              Tự chủ xây dựng giáo án, tạo video và quản lý lộ trình học tập của riêng bạn.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              2
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Thu nhập hấp dẫn</h3>
            <p className="text-sm text-gray-500">
              Nhận tới 70% doanh thu từ mỗi khóa học được bán ra trên nền tảng.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              3
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Xác thực uy tín</h3>
            <p className="text-sm text-gray-500">
              Định danh eKYC hiện đại giúp chứng nhận hồ sơ giảng viên chuẩn mực, tin cậy.
            </p>
          </div>
        </div>

        {/* Registration Box */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 max-w-xl mx-auto">
          {!submitted ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Bắt đầu làm Giảng viên
              </h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                Nhập email của bạn. Chúng tôi sẽ gửi một liên kết kích hoạt phiên tạo tài khoản.
              </p>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                  <p>{errorMessage}</p>
                  {errorMessage.includes("đăng nhập") && (
                    <a
                      href="/login"
                      className="mt-2 inline-block font-semibold text-indigo-600 hover:text-indigo-800 underline text-xs"
                    >
                      👉 Bấm vào đây để Đăng Nhập ngay
                    </a>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ Email của bạn
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? "Đang gửi liên kết..." : "Gửi liên kết đăng ký"}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ✓
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Kiểm tra hòm thư của bạn!
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Chúng tôi đã gửi một liên kết kích hoạt đến <strong>{email}</strong>.
                Liên kết này có hiệu lực trong vòng <strong>30 phút</strong>.
              </p>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="mt-6 text-sm text-indigo-600 hover:text-indigo-800 font-semibold underline"
              >
                Gửi lại email khác
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
