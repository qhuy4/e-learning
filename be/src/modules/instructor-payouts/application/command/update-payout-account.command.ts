export class UpdatePayoutAccountCommand {
  constructor(
    public readonly data: {
      id: number;
      accountType?: string;
      accountHolderName?: string;
      accountNumber?: string;
      bankName?: string;
      bankBranch?: string;
      routingCode?: string;
      paypalEmail?: string;
      currency?: string;
      isPrimary?: boolean;
      isActive?: boolean;
    },
  ) {}
}
