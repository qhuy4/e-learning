export interface TeacherRegistrationStatus {
  profileId: number;
  approvalStatus: number;
  kyc: {
    status: number;
    ocrVerified: boolean;
    faceVerified: boolean;
    rejectReason: string | null;
  } | null;
  certificates: {
    id: number;
    certificateName: string;
    status: number;
  }[];
}

export interface RegisterTeacherRequest {
  headline?: string;
  bio?: string;
  websiteUrl?: string;
  socialLinks?: Record<string, string>;
  identityNumber: string;
  certificates?: {
    certificateName: string;
    issuer?: string;
    issuedAt?: string;
    expiresAt?: string;
  }[];
}

export const APPROVAL_STATUS: Record<number, { label: string; variant: string }> = {
  1: { label: "Đang chờ duyệt", variant: "warning" },
  2: { label: "Đã được duyệt", variant: "success" },
  3: { label: "Bị từ chối", variant: "destructive" },
};

export const KYC_STATUS: Record<number, { label: string; variant: string }> = {
  1: { label: "Đang xử lý", variant: "warning" },
  2: { label: "Đã xác minh", variant: "success" },
  3: { label: "Bị từ chối", variant: "destructive" },
  4: { label: "Cần xem xét thủ công", variant: "info" },
};

export const CERT_STATUS: Record<number, { label: string; variant: string }> = {
  1: { label: "Đang chờ", variant: "warning" },
  2: { label: "Đã duyệt", variant: "success" },
  3: { label: "Bị từ chối", variant: "destructive" },
};
