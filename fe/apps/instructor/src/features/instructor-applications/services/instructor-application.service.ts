import {instructorRootApi} from "@/shared/lib/axios";

export interface InstructorApplicationView {
  id: number;
  email: string;
  fullName: string | null;
  headline: string | null;
  bio: string | null;
  websiteUrl: string | null;
  socialLinks: Record<string, string> | null;
  status: string;
  reviewReason: string | null;
  submittedAt: string | null;
}

export interface InstructorApplicationCertificateView {
  id: number;
  certificateName: string;
  issuer: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  tags: string[];
  rejectReason: string | null;
}

export interface InstructorApplicationForm {
  application: InstructorApplicationView;
  certificates: InstructorApplicationCertificateView[];
  certificateTags: string[];
}

export interface InstructorActivationView {
  email: string;
  fullName: string | null;
  requiresPassword: boolean;
  expiresAt: string;
}

export const instructorApplicationService = {
  getApplication: async (token: string): Promise<InstructorApplicationForm> => {
    const response = await instructorRootApi.get("/instructor-applications/apply", {
      params: { token },
    });
    return response.data?.data ?? response.data;
  },

  uploadCertificate: async (
    token: string,
    file: File,
  ): Promise<{
    fileKey: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await instructorRootApi.post(
      "/instructor-applications/certificates/upload",
      formData,
      {
        params: { token },
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data?.data ?? response.data;
  },

  deleteCertificate: async (token: string, certificateId: number) => {
    const response = await instructorRootApi.delete(
      `/instructor-applications/certificates/${certificateId}`,
      { params: { token } },
    );
    return response.data?.data ?? response.data;
  },

  submitApplication: async (payload: {
    token: string;
    fullName: string;
    headline?: string;
    bio?: string;
    websiteUrl?: string;
    files: File[];
  }) => {
    const formData = new FormData();
    formData.append("token", payload.token);
    formData.append("fullName", payload.fullName);
    if (payload.headline) formData.append("headline", payload.headline);
    if (payload.bio) formData.append("bio", payload.bio);
    if (payload.websiteUrl) formData.append("websiteUrl", payload.websiteUrl);
    for (const file of payload.files) {
      formData.append("files", file);
    }
    const response = await instructorRootApi.put(
      "/instructor-applications/apply",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data?.data ?? response.data;
  },

  getActivation: async (token: string): Promise<InstructorActivationView> => {
    const response = await instructorRootApi.get(
      "/instructor-applications/activate",
      { params: { token } },
    );
    return response.data?.data ?? response.data;
  },

  activate: async (payload: { token: string; password?: string }) => {
    const response = await instructorRootApi.post(
      "/instructor-applications/activate",
      payload,
    );
    return response.data?.data ?? response.data;
  },
};
