export class CreateInstructorCertificateCommand {
  constructor(
    public readonly userId: number,
    public readonly certificateName: string,
    public readonly issuer: string | null,
    public readonly issuedAt: string | null,
    public readonly expiresAt: string | null,
    public readonly filePath: string,
  ) {}
}
