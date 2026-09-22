import React, { useEffect, useState } from "react";
import { instructorService, type TeacherRegistrationStatus } from "@/features/instructor/services/instructor.service";

interface CertItem {
  certificateName: string;
  issuer: string;
  issuedAt: string;
  file: File | null;
}

export const InstructorKycPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusData, setStatusData] = useState<TeacherRegistrationStatus | null>(null);

  // Form State
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const [certificates, setCertificates] = useState<CertItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState(true);

  const fetchStatus = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsAuth(false);
      setLoading(false);
      return;
    }

    try {
      const data = await instructorService.getMyStatus();
      setStatusData(data);
    } catch {
      // Chưa nộp hồ sơ, giữ statusData = null
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAddCert = () => {
    setCertificates([
      ...certificates,
      { certificateName: "", issuer: "", issuedAt: "", file: null },
    ]);
  };

  const handleRemoveCert = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const handleCertChange = (index: number, field: keyof CertItem, value: any) => {
    const updated = [...certificates];
    updated[index] = { ...updated[index], [field]: value };
    setCertificates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontFile || !backFile || !selfieFile) {
      setErrorMessage("Vui lòng tải lên đủ 3 ảnh: CCCD mặt trước, mặt sau và ảnh Selfie.");
      return;
    }

    if (!identityNumber) {
      setErrorMessage("Vui lòng nhập số CCCD/CMND.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("identityNumber", identityNumber);
    if (headline) formData.append("headline", headline);
    if (bio) formData.append("bio", bio);
    if (websiteUrl) formData.append("websiteUrl", websiteUrl);

    const socialLinks: Record<string, string> = {};
    if (facebook) socialLinks.facebook = facebook;
    if (linkedin) socialLinks.linkedin = linkedin;
    if (Object.keys(socialLinks).length > 0) {
      formData.append("socialLinks", JSON.stringify(socialLinks));
    }

    formData.append("identity_front", frontFile);
    formData.append("identity_back", backFile);
    formData.append("selfie_with_id", selfieFile);

    // Xử lý certificates
    const certMeta = certificates
      .filter((c) => c.file && c.certificateName)
      .map((c) => ({
        certificateName: c.certificateName,
        issuer: c.issuer,
        issuedAt: c.issuedAt || undefined,
      }));

    if (certMeta.length > 0) {
      formData.append("certificates", JSON.stringify(certMeta));
      certificates
        .filter((c) => c.file && c.certificateName)
        .forEach((c) => {
          if (c.file) {
            formData.append("certificate_files", c.file);
          }
        });
    }

    try {
      const res = await instructorService.submitKyc(formData);
      setSuccessMessage(res.message || "Đã gửi hồ sơ và xác thực định danh thành công!");
      fetchStatus();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Có lỗi xảy ra trong quá trình xác thực eKYC.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🔒
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa đăng nhập tài khoản</h2>
          <p className="text-sm text-gray-600 mb-6">
            Để nộp hồ sơ eKYC, trước tiên bạn cần tạo tài khoản Giảng viên từ link kích hoạt trong email.
          </p>
          <a
            href="/teach"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Đến trang Đăng ký Giảng viên
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full mb-2">
            Bước 2: Định danh & Bằng cấp (eKYC)
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Hồ Sơ Xác Minh Giảng Viên
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Xác minh CCCD và bằng cấp chuyên môn để được kích hoạt quyền xuất bản khóa học
          </p>
        </div>

        {/* Status Alert Banner if profile exists */}
        {statusData && (
          <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              Trạng thái hồ sơ:
              {statusData.approvalStatus === 1 && (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                  Đang chờ Admin duyệt (PENDING)
                </span>
              )}
              {statusData.approvalStatus === 2 && (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                  Đã phê duyệt (APPROVED)
                </span>
              )}
              {statusData.approvalStatus === 3 && (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                  Bị từ chối (REJECTED)
                </span>
              )}
            </h3>

            {statusData.kyc && (
              <div className="text-sm text-gray-600 space-y-1 mt-3 p-4 bg-gray-50 rounded-xl">
                <p>
                  <strong>Kết quả eKYC tự động:</strong>{" "}
                  {statusData.kyc.status === 2 ? (
                    <span className="text-green-600 font-semibold">✓ Đã xác thực (VERIFIED)</span>
                  ) : statusData.kyc.status === 4 ? (
                    <span className="text-yellow-600 font-semibold">⚠ Cần đối soát thủ công (MANUAL REVIEW)</span>
                  ) : (
                    <span className="text-red-600 font-semibold">✗ Không khớp (REJECTED)</span>
                  )}
                </p>
                <p>OCR Đọc CCCD: {statusData.kyc.ocrVerified ? "Thành công" : "Chưa hoàn tất"}</p>
                <p>So khớp Khuôn mặt: {statusData.kyc.faceVerified ? "Khớp" : "Chưa đạt"}</p>
                {statusData.kyc.rejectReason && (
                  <p className="text-red-600">Ghi chú: {statusData.kyc.rejectReason}</p>
                )}
              </div>
            )}

            {statusData.approvalStatus === 2 ? (
              <p className="mt-4 text-green-700 font-medium text-sm">
                🎉 Bạn đã đủ điều kiện xuất bản các khóa học của mình lên hệ thống!
              </p>
            ) : statusData.approvalStatus === 1 ? (
              <p className="mt-4 text-gray-500 text-sm">
                Admin đang xem xét hồ sơ và bằng cấp của bạn. Bạn vẫn có thể vào Studio để tạo giáo án khóa học dạng Draft.
              </p>
            ) : null}
          </div>
        )}

        {/* KYC Submission Form (Only shown if no profile or rejected) */}
        {(!statusData || statusData.approvalStatus === 3) && (
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-xl border border-green-200">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Personal Info */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  1. Thông tin Giới thiệu
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiêu đề chuyên môn (Headline)
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="VD: Giảng viên Lập trình Web Fullstack / Senior Engineer"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiểu sử / Kinh nghiệm (Bio)
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Mô tả quá trình làm việc, giảng dạy và các kỹ năng nổi bật..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Website cá nhân</label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://mywebsite.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Facebook</label>
                      <input
                        type="url"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn</label>
                      <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Identity (eKYC) */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  2. Định danh CCCD (FPT.AI eKYC)
                </h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số CCCD / CMND <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    placeholder="VD: 079201001234 (Phải trùng với số trên ảnh)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-2 border-dashed border-gray-300 p-4 rounded-xl text-center hover:border-indigo-400 transition-colors">
                    <label className="cursor-pointer block">
                      <span className="block text-xs font-bold text-gray-700 mb-1">CCCD Mặt trước *</span>
                      <span className="block text-xs text-gray-500 mb-2">Ảnh rõ nét, đủ 4 góc</span>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                        className="text-xs w-full"
                      />
                      {frontFile && <p className="mt-2 text-xs text-green-600 font-semibold truncate">✓ {frontFile.name}</p>}
                    </label>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 p-4 rounded-xl text-center hover:border-indigo-400 transition-colors">
                    <label className="cursor-pointer block">
                      <span className="block text-xs font-bold text-gray-700 mb-1">CCCD Mặt sau *</span>
                      <span className="block text-xs text-gray-500 mb-2">Rõ vân tay & ngày cấp</span>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                        className="text-xs w-full"
                      />
                      {backFile && <p className="mt-2 text-xs text-green-600 font-semibold truncate">✓ {backFile.name}</p>}
                    </label>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 p-4 rounded-xl text-center hover:border-indigo-400 transition-colors">
                    <label className="cursor-pointer block">
                      <span className="block text-xs font-bold text-gray-700 mb-1">Ảnh Selfie Chân dung *</span>
                      <span className="block text-xs text-gray-500 mb-2">Rõ mặt, không đeo kính râm</span>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                        className="text-xs w-full"
                      />
                      {selfieFile && <p className="mt-2 text-xs text-green-600 font-semibold truncate">✓ {selfieFile.name}</p>}
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 3: Certificates */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">
                    3. Bằng cấp & Chứng chỉ Chuyên môn
                  </h2>
                  <button
                    type="button"
                    onClick={handleAddCert}
                    className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold py-1.5 px-3 rounded-lg transition-colors"
                  >
                    + Thêm chứng chỉ
                  </button>
                </div>

                {certificates.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">
                    Chưa có chứng chỉ nào được thêm. Bạn có thể thêm bằng cấp chuyên ngành, chứng chỉ quốc tế để tăng uy tín.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {certificates.map((cert, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveCert(index)}
                          className="absolute top-2 right-2 text-red-500 text-xs hover:underline font-bold"
                        >
                          Xóa
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tên chứng chỉ</label>
                            <input
                              type="text"
                              value={cert.certificateName}
                              onChange={(e) => handleCertChange(index, "certificateName", e.target.value)}
                              placeholder="VD: IELTS 7.5, AWS Architect"
                              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Đơn vị cấp</label>
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => handleCertChange(index, "issuer", e.target.value)}
                              placeholder="VD: IDP, Amazon"
                              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Ngày cấp</label>
                            <input
                              type="date"
                              value={cert.issuedAt}
                              onChange={(e) => handleCertChange(index, "issuedAt", e.target.value)}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">File chứng chỉ (Ảnh/Scan)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCertChange(index, "file", e.target.files?.[0] || null)}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 text-base shadow-lg shadow-indigo-100"
              >
                {submitting ? "Đang xử lý eKYC qua FPT AI..." : "Nộp Hồ Sơ & Xác Thực eKYC"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
