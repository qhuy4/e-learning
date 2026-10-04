export class TeacherRegistrationStatusResponseDto {
  profileId: number;
  approvalStatus: number;
  reviewReason: string | null;
  certificates: {
    id: number;
    certificateName: string;
    status: number;
  }[];
}
