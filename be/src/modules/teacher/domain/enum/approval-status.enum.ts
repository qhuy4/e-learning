/**
 * Trạng thái duyệt hồ sơ giáo viên (instructor_profiles.approval_status).
 * Đây là trạng thái "tổng" do admin quyết định cuối cùng, độc lập với
 * KycStatus (KYC chỉ là một điều kiện đầu vào để admin xét duyệt).
 */
export enum ApprovalStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}
