import React, { useEffect, useState } from "react";
import {
  adminInstructorService,
  type PendingInstructorProfile,
} from "@/features/instructors/service";

const getMediaUrl = (pathStr: string | null | undefined) => {
  if (!pathStr) return "";
  if (pathStr.startsWith("http")) return pathStr;
  const cleanPath = pathStr.replace(/\\/g, "/").replace(/^\/?/, "");
  return `http://localhost:3001/${cleanPath}`;
};

export const InstructorApprovalsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<PendingInstructorProfile[]>([]);
  const [selectedProfile, setSelectedProfile] =
    useState<PendingInstructorProfile | null>(null);

  // Review Modal State
  const [reviewing, setReviewing] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await adminInstructorService.getPendingProfiles(1); // 1 = PENDING
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setProfiles(list);
    } catch (err: any) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách hồ sơ giảng viên.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleApprove = async (profileId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn PHÊ DUYỆT hồ sơ giảng viên này?"))
      return;

    setReviewing(true);
    try {
      await adminInstructorService.reviewProfile(profileId, 2); // 2 = APPROVED
      setMessage({
        type: "success",
        text: "Đã phê duyệt hồ sơ giảng viên thành công!",
      });
      setSelectedProfile(null);
      fetchProfiles();
    } catch (err: any) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Lỗi khi phê duyệt hồ sơ.",
      });
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProfile) return;

    setReviewing(true);
    try {
      await adminInstructorService.reviewProfile(
        selectedProfile.profileId,
        3,
        rejectReason,
      ); // 3 = REJECTED
      setMessage({
        type: "success",
        text: "Đã từ chối hồ sơ giảng viên.",
      });
      setRejectModalOpen(false);
      setSelectedProfile(null);
      setRejectReason("");
      fetchProfiles();
    } catch (err: any) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Lỗi khi từ chối hồ sơ.",
      });
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Duyệt Hồ Sơ Giảng Viên (eKYC)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Đối soát thông tin CCCD, kết quả xác thực khuôn mặt FPT.AI và bằng
            cấp chuyên môn
          </p>
        </div>
        <button
          onClick={fetchProfiles}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
        >
          Làm mới ↻
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Đang tải danh sách hồ sơ...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-500 text-base font-medium">
            Hiện không có hồ sơ giảng viên nào đang chờ duyệt.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Giảng viên
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Chuyên môn
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Số CCCD / CMND
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Kết quả eKYC
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Chứng chỉ
                </th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profiles.map((p) => (
                <tr key={p.profileId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {p.user?.name || `User #${p.userId}`}
                    </div>
                    <div className="text-xs text-gray-500">{p.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {p.headline || "Chưa cập nhật"}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-800">
                    {p.kyc?.identityNumber || "—"}
                  </td>
                  <td className="px-6 py-4">
                    {p.kyc?.kycStatus === 2 ? (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                        ✓ VERIFIED ({p.kyc?.faceData?.similarity ?? 100}%)
                      </span>
                    ) : p.kyc?.kycStatus === 4 ? (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                        ⚠ MANUAL REVIEW
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                        ✗ REJECTED
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {p.certificates?.length || 0} file
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedProfile(p)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Xem chi tiết & Đối soát
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail & Review Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Đối Soát Hồ Sơ:{" "}
                  {selectedProfile.user?.name ||
                    `User #${selectedProfile.userId}`}
                </h3>
                <p className="text-xs text-gray-500">
                  Email: {selectedProfile.user?.email} | Ngày gửi:{" "}
                  {new Date(selectedProfile.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Tiêu đề chuyên môn:</p>
                <p className="text-sm font-semibold text-gray-800">
                  {selectedProfile.headline || "Không có"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Website / Portfolio:</p>
                <p className="text-sm font-semibold text-indigo-600 truncate">
                  {selectedProfile.websiteUrl || "Không có"}
                </p>
              </div>S
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500">Tiểu sử (Bio):</p>
                <p className="text-sm text-gray-700 mt-1">
                  {selectedProfile.bio || "Không có"}
                </p>
              </div>
            </div>

            {/* eKYC Verification & OCR */}
            <div className="mb-6">
              <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                Kết Quả Định Danh FPT.AI eKYC
              </h4>

              {selectedProfile.kyc ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                    <div>
                      <span className="text-gray-500 block">
                        Số CCCD Khai báo:
                      </span>
                      <strong className="text-gray-900 font-mono text-sm">
                        {selectedProfile.kyc.identityNumber}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">
                        Số CCCD OCR Đọc:
                      </span>
                      <strong className="text-gray-900 font-mono text-sm">
                        {selectedProfile.kyc.ocrData?.["ID"] ||
                          selectedProfile.kyc.ocrData?.["id"] ||
                          "—"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">
                        Điểm khớp khuôn mặt:
                      </span>
                      <strong className="text-indigo-700 text-sm">
                        {selectedProfile.kyc.faceData?.similarity || "—"}%
                      </strong>
                    </div>
                  </div>

                  {/* OCR Extracted details */}
                  {selectedProfile.kyc.ocrData && (
                    <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                      <p className="font-semibold text-gray-700 mb-1">
                        Thông tin chi tiết bóc tách từ OCR CCCD:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-gray-600">
                        <p>
                          Họ và tên:{" "}
                          <strong>
                            {selectedProfile.kyc.ocrData["NAME"] ||
                              selectedProfile.kyc.ocrData["name"] ||
                              "—"}
                          </strong>
                        </p>
                        <p>
                          Ngày sinh:{" "}
                          <strong>
                            {selectedProfile.kyc.ocrData["DOB"] ||
                              selectedProfile.kyc.ocrData["dob"] ||
                              "—"}
                          </strong>
                        </p>
                        <p>
                          Giới tính:{" "}
                          <strong>
                            {selectedProfile.kyc.ocrData["SEX"] ||
                              selectedProfile.kyc.ocrData["sex"] ||
                              "—"}
                          </strong>
                        </p>
                        <p>
                          Quê quán:{" "}
                          <strong>
                            {selectedProfile.kyc.ocrData["HOME"] ||
                              selectedProfile.kyc.ocrData["home"] ||
                              "—"}
                          </strong>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Image Previews */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 text-center">
                      <span className="block text-xs font-semibold text-gray-700 py-1.5 bg-gray-100 border-b">
                        CCCD Mặt trước
                      </span>
                      <img
                        src={getMediaUrl(selectedProfile.kyc.identityFront)}
                        alt="CCCD Mặt trước"
                        className="w-full h-36 object-cover hover:opacity-90 cursor-pointer"
                        onClick={() =>
                          window.open(
                            getMediaUrl(selectedProfile.kyc?.identityFront),
                            "_blank",
                          )
                        }
                      />
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 text-center">
                      <span className="block text-xs font-semibold text-gray-700 py-1.5 bg-gray-100 border-b">
                        CCCD Mặt sau
                      </span>
                      <img
                        src={getMediaUrl(selectedProfile.kyc.identityBack)}
                        alt="CCCD Mặt sau"
                        className="w-full h-36 object-cover hover:opacity-90 cursor-pointer"
                        onClick={() =>
                          window.open(
                            getMediaUrl(selectedProfile.kyc?.identityBack),
                            "_blank",
                          )
                        }
                      />
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 text-center">
                      <span className="block text-xs font-semibold text-gray-700 py-1.5 bg-gray-100 border-b">
                        Ảnh Chân dung / Selfie
                      </span>
                      <img
                        src={getMediaUrl(selectedProfile.kyc.selfieWithId)}
                        alt="Ảnh Selfie"
                        className="w-full h-36 object-cover hover:opacity-90 cursor-pointer"
                        onClick={() =>
                          window.open(
                            getMediaUrl(selectedProfile.kyc?.selfieWithId),
                            "_blank",
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Chưa có dữ liệu eKYC.
                </p>
              )}
            </div>

            {/* Certificates List */}
            <div className="mb-8">
              <h4 className="text-base font-bold text-gray-900 mb-3">
                Chứng Chỉ & Bằng Cấp ({selectedProfile.certificates.length})
              </h4>
              {selectedProfile.certificates.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  Không nộp chứng chỉ kèm theo.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedProfile.certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3 bg-gray-50 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-gray-900 text-sm block">
                          {cert.certificateName}
                        </strong>
                        <span className="text-gray-500">
                          Đơn vị cấp: {cert.issuer || "Không ghi"} | Ngày cấp:{" "}
                          {cert.issuedAt || "—"}
                        </span>
                      </div>
                      <span className="text-gray-400 font-mono text-[10px] truncate max-w-xs">
                        {cert.filePath}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={reviewing}
                onClick={() => setRejectModalOpen(true)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Từ chối (Reject)
              </button>
              <button
                type="button"
                disabled={reviewing}
                onClick={() => handleApprove(selectedProfile.profileId)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {reviewing ? "Đang xử lý..." : "Phê duyệt (Approve)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Lý do từ chối hồ sơ
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Lý do này sẽ được thông báo lại cho giảng viên để họ chỉnh sửa và
              nộp lại hồ sơ.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Ảnh CCCD bị mờ góc hoặc khuôn mặt selfie không trùng khớp..."
              className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={reviewing}
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg"
              >
                {reviewing ? "Đang lưu..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
