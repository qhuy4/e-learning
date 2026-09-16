import { api } from "@fe/lib/axios";
import type { RegisterTeacherRequest } from "../types/teacher.types";

export const teacherService = {
  async register(data: RegisterTeacherRequest, files: {
    identity_front: File;
    identity_back: File;
    selfie_with_id: File;
    certificate_files?: File[];
  }) {
    const fd = new FormData();
    fd.append("identityNumber", data.identityNumber);
    if (data.headline) fd.append("headline", data.headline);
    if (data.bio) fd.append("bio", data.bio);
    if (data.websiteUrl) fd.append("websiteUrl", data.websiteUrl);
    if (data.socialLinks) fd.append("socialLinks", JSON.stringify(data.socialLinks));
    if (data.certificates && data.certificates.length > 0) {
      fd.append("certificates", JSON.stringify(data.certificates));
    }

    fd.append("identity_front", files.identity_front);
    fd.append("identity_back", files.identity_back);
    fd.append("selfie_with_id", files.selfie_with_id);
    if (files.certificate_files) {
      files.certificate_files.forEach((f) => fd.append("certificate_files", f));
    }

    const response = await api.post("/teachers/register", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async getMyStatus() {
    const response = await api.get("/teachers/my-status");
    return response.data;
  },
};
