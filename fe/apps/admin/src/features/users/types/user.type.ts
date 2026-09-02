import type {Gender, UserRole, UserStatus} from "@/features/users/constants/users.constants.ts";

export interface UserProfile {
    id: number;
    userId: number;
    avatarUrl: string | null;
    gender: Gender | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    dateOfBirth: Date | null;
    address: string | null;
    country: string | null;
    city: string | null;
    occupation: string | null;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    id: number;
    name: string;
    email: string;
    status: UserStatus;
    role: UserRole;
    blockReason: string | null;
    blockedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    profile: UserProfile;
}

export type UserProfileInput = Omit<
    UserProfile,
    "id" | "userId" | "createdAt" | "updatedAt"
>

export type UserWriteInput = {
    name: string
    email: string
    password?: string
    status: UserStatus
    role: UserRole
    block_reason: string | null
    avatarFile?: File | null
    profile: UserProfileInput
}
