import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  adminInstructorService,
} from "@/features/instructors/service";
import type { PendingInstructorProfile } from "@/features/instructors/type/pending-instructor.ts";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { DataTable } from "@/components/common/data-table/data-table.tsx";
import { createInstructorApprovalColumns } from "@/features/instructors/approval-columns.tsx";

const getMediaUrl = (pathStr: string | null | undefined) => {
  if (!pathStr) return "";
  if (pathStr.startsWith("http")) return pathStr;
  const cleanPath = pathStr.replace(/\\/g, "/").replace(/^\/?/, "");
  return `http://localhost:3001/${cleanPath}`;
};

export const InstructorApprovalsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<PendingInstructorProfile[]>([]);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(1); // 1 = PENDING default
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] =
    useState<PendingInstructorProfile | null>(null);

  // Review Modal State
  const [reviewing, setReviewing] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { confirm, confirmState, handleConfirm, handleCancel } =
    useConfirmDialog();

  const fetchProfiles = async (status?: number) => {
    setLoading(true);
    try {
      const res = await adminInstructorService.getPendingProfiles(status);
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setProfiles(list);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Không thể tải danh sách hồ sơ giảng viên.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles(statusFilter);
  }, [statusFilter]);

  const filteredProfiles = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    if (!keyword) return profiles;

    return profiles.filter((profile) =>
      [profile.user?.name, profile.user?.email, profile.headline, profile.bio, profile.kyc?.identityNumber]
        .some((value) => value?.toLocaleLowerCase("vi").includes(keyword)),
    );
  }, [profiles, search]);

  const totalPages = Math.ceil(filteredProfiles.length / pageSize);
  const visibleProfiles = useMemo(
    () => filteredProfiles.slice((page - 1) * pageSize, page * pageSize),
    [filteredProfiles, page, pageSize],
  );
  const columns = useMemo(() => createInstructorApprovalColumns(), []);

  const handleApprove = async (profileId: number) => {
    const ok = await confirm({
      title: "Phê duyệt hồ sơ giảng viên",
      description:
        "Bạn có chắc chắn muốn PHÊ DUYỆT hồ sơ giảng viên này? Sau khi duyệt, giảng viên sẽ được kích hoạt toàn quyền xuất bản khóa học và tạo doanh thu.",
      confirmLabel: "Phê duyệt ngay",
      cancelLabel: "Hủy bỏ",
      variant: "default",
    });

    if (!ok) return;

    const tid = toast.loading("Đang phê duyệt hồ sơ...");
    setReviewing(true);
    try {
      await adminInstructorService.reviewProfile(profileId, 2); // 2 = APPROVED
      toast.success("Đã phê duyệt hồ sơ giảng viên thành công!", { id: tid });
      setSelectedProfile(null);
      fetchProfiles(statusFilter);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Lỗi khi phê duyệt hồ sơ.";
      toast.error(msg, { id: tid });
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProfile) return;

    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối hồ sơ.");
      return;
    }

    const tid = toast.loading("Đang xử lý từ chối hồ sơ...");
    setReviewing(true);
    try {
      await adminInstructorService.reviewProfile(
        selectedProfile.profileId,
        3,
        rejectReason,
      ); // 3 = REJECTED
      toast.success("Đã từ chối hồ sơ giảng viên thành công.", { id: tid });
      setRejectModalOpen(false);
      setSelectedProfile(null);
      setRejectReason("");
      fetchProfiles(statusFilter);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Lỗi khi từ chối hồ sơ.";
      toast.error(msg, { id: tid });
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Quản Lý & Duyệt Giảng Viên (eKYC)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Đối soát thông tin CCCD, kết quả xác thực khuôn mặt FPT.AI và bằng
            cấp chuyên môn của giảng viên
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        {[
          { label: "Chờ duyệt (Pending)", val: 1 },
          { label: "Đã phê duyệt (Approved)", val: 2 },
          { label: "Đã từ chối (Rejected)", val: 3 },
          { label: "Tất cả hồ sơ", val: undefined },
        ].map((tab) => (
          <button
            key={String(tab.val)}
            onClick={() => {
              setStatusFilter(tab.val);
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === tab.val
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={visibleProfiles}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        loading={loading}
        refetch={() => fetchProfiles(statusFilter)}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        onRowClick={setSelectedProfile}
        tableMeta={{onView: setSelectedProfile, onApprove: handleApprove, reviewing}}
        text={{
          searchPlaceholder: "Tìm tên, email, chuyên môn hoặc CCCD...",
          reload: "Làm mới",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có hồ sơ nào trong mục này.",
          pageOf: (current, total) => `Trang ${current} / ${total || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />

      {/* Review Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800 p-6 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Hồ Sơ Giảng Viên & Bằng Chứng eKYC
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Mã hồ sơ: #{selectedProfile.profileId} | User:{" "}
                  {selectedProfile.user?.name} ({selectedProfile.user?.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Tiêu đề chuyên môn:</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {selectedProfile.bio || "Không có"}
                </p>
              </div>
            </div>

            {/* eKYC Verification & OCR */}
            <div className="mb-6">
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                Kết Quả Định Danh FPT.AI eKYC
              </h4>

              {selectedProfile.kyc ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs">
                    <div>
                      <span className="text-gray-500 block">
                        Số CCCD Khai báo:
                      </span>
                      <strong className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                        {selectedProfile.kyc.identityNumber}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">
                        Số CCCD OCR Đọc:
                      </span>
                      <strong className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                        {selectedProfile.kyc.ocrData?.["ID"] ||
                          selectedProfile.kyc.ocrData?.["id"] ||
                          "—"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">
                        Điểm khớp khuôn mặt:
                      </span>
                      <strong className="text-indigo-700 dark:text-indigo-400 text-sm">
                        {selectedProfile.kyc.faceData?.similarity || "—"}%
                      </strong>
                    </div>
                  </div>

                  {/* Image Previews */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 text-center">
                      <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 py-1.5 bg-gray-100 dark:bg-gray-700 border-b">
                        CCCD Mặt trước (Click xem)
                      </span>
                      <img
                        src={getMediaUrl(selectedProfile.kyc.identityFront)}
                        alt="CCCD Mặt trước"
                        className="w-full h-40 object-cover hover:opacity-90 cursor-pointer"
                        onClick={() =>
                          window.open(
                            getMediaUrl(selectedProfile.kyc?.identityFront),
                            "_blank",
                          )
                        }
                      />
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 text-center">
                      <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 py-1.5 bg-gray-100 dark:bg-gray-700 border-b">
                        CCCD Mặt sau (Click xem)
                      </span>
                      <img
                        src={getMediaUrl(selectedProfile.kyc.identityBack)}
                        alt="CCCD Mặt sau"
                        className="w-full h-40 object-cover hover:opacity-90 cursor-pointer"
                        onClick={() =>
                          window.open(
                            getMediaUrl(selectedProfile.kyc?.identityBack),
                            "_blank",
                          )
                        }
                      />
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 text-center">
                      <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 py-1.5 bg-gray-100 dark:bg-gray-700 border-b">
                        Ảnh Chân dung / Selfie
                      </span>
                      <img
                        src={getMediaUrl(selectedProfile.kyc.selfieWithId)}
                        alt="Ảnh Selfie"
                        className="w-full h-40 object-cover hover:opacity-90 cursor-pointer"
                        onClick={() =>
                          window.open(
                            getMediaUrl(selectedProfile.kyc?.selfieWithId),
                            "_blank",
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Reject Note if any */}
                  {selectedProfile.kyc.rejectReason && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                      <strong>Ghi chú hệ thống:</strong>{" "}
                      {selectedProfile.kyc.rejectReason}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Chưa có dữ liệu eKYC.
                </p>
              )}
            </div>

            {/* Certificates List */}
            <div className="mb-8">
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
                Chứng Chỉ & Bằng Cấp ({selectedProfile.certificates.length})
              </h4>
              {selectedProfile.certificates.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  Không nộp chứng chỉ kèm theo.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedProfile.certificates.map((cert: any) => (
                    <div
                      key={cert.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-gray-900 dark:text-gray-100 text-sm block">
                          {cert.certificateName}
                        </strong>
                        <span className="text-gray-500">
                          Đơn vị cấp: {cert.issuer || "Không ghi"} | Ngày cấp:{" "}
                          {cert.issuedAt || "—"}
                        </span>
                      </div>
                      <a
                        href={getMediaUrl(cert.filePath)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-indigo-600 dark:text-indigo-300 hover:underline"
                      >
                        Xem file tệp
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg"
              >
                Đóng
              </button>
              {selectedProfile.approvalStatus === 1 && (
                <>
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
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                  >
                    Phê duyệt hồ sơ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Prompt Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Từ Chối Hồ Sơ Giảng Viên
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Vui lòng nhập lý do từ chối để gửi thông báo giải thích cho giảng
              viên biết cần bổ sung thông tin gì.
            </p>

            <textarea
              required
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Ảnh chụp CCCD bị mờ góc hoặc giấy tờ không hợp lệ..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none dark:bg-gray-800 dark:text-gray-100 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={reviewing || !rejectReason.trim()}
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
              >
                Xác nhận Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Confirm Dialog */}
      <ConfirmDialog
        {...confirmState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};
