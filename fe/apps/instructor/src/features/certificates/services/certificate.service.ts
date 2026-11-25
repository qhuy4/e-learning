import { instructorApi } from "@/shared/lib/axios";
import type { Certificate } from "../types/certificate";

export interface CreateCertificateParams {
  certificateName: string;
  issuer?: string;
  issuedAt?: string;
  expiresAt?: string;
  file: File;
}

export const certificateService = {
  async getCertificates(): Promise<{ data: Certificate[] }> {
    const response = await instructorApi.get("/certificates");
    return response.data;
  },

  async getCertificateById(id: number) {
    const response = await instructorApi.get(`/certificates/${id}`);
    return response.data;
  },

  async createCertificate(params: CreateCertificateParams) {
    const formData = new FormData();
    formData.append("certificateName", params.certificateName);
    if (params.issuer) formData.append("issuer", params.issuer);
    if (params.issuedAt) formData.append("issuedAt", params.issuedAt);
    if (params.expiresAt) formData.append("expiresAt", params.expiresAt);
    formData.append("file", params.file);

    const response = await instructorApi.post("/certificates", formData, {
      headers: { "Content-Type": undefined },
    });
    return response.data;
  },

  async deleteCertificate(id: number) {
    const response = await instructorApi.delete(`/certificates/${id}`);
    return response.data;
  },
};
