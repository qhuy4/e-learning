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
