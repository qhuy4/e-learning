/**
 * Trạng thái duyệt của từng chứng chỉ/bằng cấp giáo viên nộp lên.
 * Map với cột `instructor_certificates.certificate_status` (smallint).
 */
export enum CertificateStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}
