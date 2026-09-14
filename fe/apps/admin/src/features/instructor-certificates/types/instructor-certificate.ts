export type InstructorCertificateStatus = 0 | 1 | 2 | 3;

export const instructorCertificateStatusLabel: Record<InstructorCertificateStatus, string> = {
  0: "Nháp",
  1: "Chờ duyệt",
  2: "Đã duyệt",
  3: "Bị từ chối",
};

export const instructorCertificateStatusClassName: Record<InstructorCertificateStatus, string> = {
  0: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  1: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  2: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  3: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export interface InstructorCertificateUser {
  id: number;
  name: string;
  email?: string;
}

export interface InstructorCertificate {
  id: number;
  userId: number;
  certificateName: string;
  issuer: string | null;
  filePath: string;
  issuedAt: string | null;
  expiresAt: string | null;
  certificateStatus: InstructorCertificateStatus;
  rejectReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: InstructorCertificateUser;
  reviewer?: InstructorCertificateUser;
}

export interface PaginatedInstructorCertificateResponse {
  data: InstructorCertificate[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
