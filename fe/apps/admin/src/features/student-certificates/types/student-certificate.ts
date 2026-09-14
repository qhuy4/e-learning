export interface CertificateUser {
  id: number;
  name: string;
  email?: string;
}

export interface CertificateCourse {
  id: number;
  title: string;
}

export interface Certificate {
  id: number;
  userId: number;
  courseId: number;
  enrollmentId: number;
  certCode: string;
  issuedAt: string;
  pdfUrl: string;
  createdAt: string;
  updatedAt?: string;
  user?: CertificateUser;
  course?: CertificateCourse;
}

export interface PaginatedCertificateResponse {
  data: Certificate[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
