export type InstructorApplicationStatus =
  | "PENDING_SUBMISSION"
  | "PENDING_INFORMATION"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface OcrFieldValue<T> {
  value: T;
  confidence: number | null;
}

export interface CertificateOcrScores {
  overall: number | null;
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
}

export interface CertificateOcrData {
  document_type: "IELTS_TRF" | "TOEIC" | "UNKNOWN";
  candidate_name: OcrFieldValue<string> | null;
  test_report_form_number: OcrFieldValue<string> | null;
  test_date: OcrFieldValue<string> | null;
  date_of_birth: OcrFieldValue<string> | null;
  test_type: OcrFieldValue<"ACADEMIC" | "GENERAL_TRAINING"> | null;
  issuing_organization: OcrFieldValue<string> | null;
  scores: CertificateOcrScores;
  cefr_level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
  verification_status: "UNVERIFIED";
  extraction_warnings: string[];
  document_image_hash: string | null;
}

export interface InstructorApplicationCertificate {
  id: number;
  certificateName: string;
  issuer: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  fileKey: string | null;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  tags: string[];
  rejectReason: string | null;
  ocrStatus: "pending" | "completed" | "failed";
  ocrRawText: string | null;
  ocrExtractedData: CertificateOcrData | null;
}

export interface ReviewedCertificateOcrInput {
  documentType: "IELTS_TRF" | "TOEIC";
  candidateName?: string;
  credentialNumber?: string;
  testDate?: string;
  issuer?: string;
  overall?: number;
  listening?: number;
  reading?: number;
  writing?: number;
  speaking?: number;
}

export interface PendingInstructorProfile {
  id: number;
  profileId: number;
  userId: number | null;
  email: string;
  fullName: string | null;
  headline: string | null;
  bio: string | null;
  websiteUrl: string | null;
  socialLinks: Record<string, string> | null;
  status: InstructorApplicationStatus;
  reviewReason: string | null;
  createdAt: string;
  submittedAt: string | null;
  activatedAt: string | null;
  requiresPassword: boolean;
  certificates: InstructorApplicationCertificate[];
  certificateTags: string[];
  certificateCount: number;
}
