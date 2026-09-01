export interface RegisterTeacherCertificateInput {
  certificateName: string;
  issuer?: string;
  issuedAt?: string; // 'YYYY-MM-DD'
  expiresAt?: string; // 'YYYY-MM-DD'
  /** Đường dẫn file đã được lưu trên server (đã upload xong trước đó) */
  filePath: string;
}

export class RegisterTeacherCommand {
  constructor(
    /** userId của người đang thực hiện đăng ký (lấy từ JWT ở tầng controller) */
    public readonly userId: number,
    public readonly headline: string | undefined,
    public readonly bio: string | undefined,
    public readonly websiteUrl: string | undefined,
    public readonly socialLinks: Record<string, string> | undefined,
    // --- Thông tin định danh (KYC) ---
    public readonly identityNumber: string,
    public readonly identityFrontPath: string,
    public readonly identityBackPath: string,
    public readonly selfiePath: string,
    // --- Bằng cấp / chứng chỉ ---
    public readonly certificates: RegisterTeacherCertificateInput[],
  ) {}
}
