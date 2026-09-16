export class PayoutAccount {
  private constructor(
    public readonly id: number,
    public readonly instructorProfileId: number,
    public readonly accountType: string,
    public readonly accountHolderName: string,
    public readonly accountNumber: string | null,
    public readonly bankName: string | null,
    public readonly bankBranch: string | null,
    public readonly routingCode: string | null,
    public readonly paypalEmail: string | null,
    public readonly externalRef: string | null,
    public readonly casGrantId: string | null,
    public readonly currency: string,
    public readonly isPrimary: boolean,
    public readonly isVerified: boolean,
    public readonly verifiedAt: Date | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
  ) {}

  static restore(params: {
    id: number;
    instructorProfileId: number;
    accountType: string;
    accountHolderName: string;
    accountNumber: string | null;
    bankName: string | null;
    bankBranch: string | null;
    routingCode: string | null;
    paypalEmail: string | null;
    externalRef: string | null;
    casGrantId: string | null;
    currency: string;
    isPrimary: boolean;
    isVerified: boolean;
    verifiedAt: Date | null;
    isActive: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): PayoutAccount {
    return new PayoutAccount(
      params.id,
      params.instructorProfileId,
      params.accountType,
      params.accountHolderName,
      params.accountNumber,
      params.bankName,
      params.bankBranch,
      params.routingCode,
      params.paypalEmail,
      params.externalRef,
      params.casGrantId,
      params.currency,
      params.isPrimary,
      params.isVerified,
      params.verifiedAt,
      params.isActive,
      params.createdAt,
      params.updatedAt,
    );
  }
}
