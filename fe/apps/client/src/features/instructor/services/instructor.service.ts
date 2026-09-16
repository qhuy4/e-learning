import { api } from "@fe/lib/axios";

export interface RegisterInstructorPayload {
  session: string;
  name: string;
  password: string;
}

export interface TeacherRegistrationStatus {
  profileId: number;
  approvalStatus: number; // 1: PENDING, 2: APPROVED, 3: REJECTED
  kyc: {
    status: number; // 1: PENDING, 2: VERIFIED, 3: REJECTED, 4: MANUAL_REVIEW
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

export const instructorService = {
  /** Gửi email mời đăng ký giảng viên */
  sendInvite: async (email: string) => {
    const response = await api.post("/auth/instructor/send-invite", { email });
    return response.data?.data ?? response.data;
  },

  /** Kiểm tra session token */
  verifySession: async (session: string) => {
    const response = await api.get(`/auth/instructor/verify-session?session=${encodeURIComponent(session)}`);
    return response.data?.data ?? response.data;
  },

  /** Đăng ký tài khoản Giảng viên với session */
  register: async (payload: RegisterInstructorPayload) => {
    const response = await api.post("/auth/instructor/register", payload);
    return response.data?.data ?? response.data;
  },

  /** Nộp hồ sơ eKYC CCCD & Bằng cấp (form-data) */
  submitKyc: async (formData: FormData) => {
    const response = await api.post("/teachers/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data?.data ?? response.data;
  },

  /** Lấy trạng thái hồ sơ của user hiện tại */
  getMyStatus: async (): Promise<TeacherRegistrationStatus> => {
    const response = await api.get("/teachers/my-status");
    return response.data?.data ?? response.data;
  },

  /** Đăng nhập */
  login: async (payload: { email: string; password: string }) => {
    const response = await api.post("/instructor/auth/login", payload);
    return response.data?.data ?? response.data;
  },
};
