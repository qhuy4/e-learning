export const PAYOUT_ACCOUNT_REPOSITORY = 'PAYOUT_ACCOUNT_REPOSITORY';

export interface IPayoutAccountRepository {
  findByInstructorProfileId(instructorProfileId: number): Promise<any[]>;
  findById(id: number): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: number, data: any): Promise<any>;
  delete(id: number): Promise<void>;
}
