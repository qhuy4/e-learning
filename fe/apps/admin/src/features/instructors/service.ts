import { api } from "@fe/lib/axios";

export interface PendingInstructorProfile {
  profileId: number;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
    joinedAt: string;
  } | null;
  headline: string | null;
  bio: string | null;
  websiteUrl: string | null;
  socialLinks: Record<string, string> | null;
  approvalStatus: number;
  createdAt: string;
  kyc: {
    id: number;
    kycStatus: number;
    identityNumber: string;
    identityFront: string;
    identityBack: string;
    selfieWithId: string;
    ocrVerified: boolean;
    faceVerified: boolean;
    ocrData: Record<string, any> | null;
    faceData: {
      similarity?: number;
      isLive?: boolean;
      isMatch?: boolean;
    } | null;
    rejectReason: string | null;
  } | null;
  certificates: {
    id: number;
    certificateName: string;
    issuer: string | null;
    filePath: string;
    issuedAt: string | null;
    expiresAt: string | null;
    status: number;
  }[];
}

export const adminInstructorService = {
  getPendingProfiles: async (status?: number): Promise<PendingInstructorProfile[]> => {
    const url = status ? `/admin/teachers/pending-profiles?status=${status}` : "/admin/teachers/pending-profiles";
    const response = await api.get(url);
    const res = response.data?.data ?? response.data;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  },

  reviewProfile: async (profileId: number, status: number, rejectReason?: string) => {
    const response = await api.patch(`/admin/teachers/${profileId}/review`, {
      status,
      rejectReason,
    });
    return response.data?.data ?? response.data;
  },
};
