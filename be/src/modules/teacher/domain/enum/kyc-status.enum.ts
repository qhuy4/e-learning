/**
 * Trạng thái xác thực định danh (eKYC) của giáo viên.
 * Map trực tiếp với cột `instructor_kyc.kyc_status` (smallint) trong DB.
 */
export enum KycStatus {
  /** Vừa nộp hồ sơ / đang chờ xử lý eKYC hoặc chờ admin duyệt tay */
  PENDING = 1,
  /** eKYC (OCR + face match) xác thực thành công */
  VERIFIED = 2,
  /** eKYC xác thực thất bại (OCR lỗi, khuôn mặt không khớp, ...) */
  REJECTED = 3,
  /** Kết quả eKYC không đủ tin cậy (VD: OCR ok nhưng face match điểm thấp,
   *  hoặc bên thứ 3 lỗi hệ thống) -> cần admin xem xét thủ công */
  MANUAL_REVIEW = 4,
}
