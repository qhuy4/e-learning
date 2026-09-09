export interface PendingInstructorProfile {
    profileId: number;
    userId: number;
    user: {
        id: number;
        name: string;
        email: string;
        joinedAt: string;
    } | null;
    headline: string | null;
    bio: string | null;
    websiteUrl: string | null;
    socialLinks: Record<string, string> | null;
    approvalStatus: number;
    createdAt: string;
    kyc: {
        id: number;
        kycStatus: number;
        identityNumber: string;
        identityFront: string;
        identityBack: string;
        selfieWithId: string;
        ocrVerified: boolean;
        faceVerified: boolean;
        ocrData: Record<string, any> | null;
        faceData: {
            similarity?: number;
            isLive?: boolean;
            isMatch?: boolean;
        } | null;
        rejectReason: string | null;
    } | null;
    certificates: {
        id: number;
        certificateName: string;
        issuer: string | null;
        filePath: string;
        issuedAt: string | null;
        expiresAt: string | null;
        status: number;
    }[];
}