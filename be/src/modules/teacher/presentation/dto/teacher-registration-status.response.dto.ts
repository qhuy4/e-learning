export class TeacherRegistrationStatusResponseDto {
  profileId: number;
  approvalStatus: number;
  kyc: {
    status: number;
    ocrVerified: boolean;
    faceVerified: boolean;
    rejectReason: string | null;
  } | null;
  certificates: {
    id: number;
    certificateName: string;
    status: number;
  }[];
}
