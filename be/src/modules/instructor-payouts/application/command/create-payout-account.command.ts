export class CreatePayoutAccountCommand {
  constructor(
    public readonly data: {
      instructorProfileId: number;
      accountType: string;
      accountHolderName: string;
      accountNumber?: string;
      bankName?: string;
      bankBranch?: string;
      routingCode?: string;
      paypalEmail?: string;
      currency?: string;
      isPrimary?: boolean;
    },
  ) {}
}
