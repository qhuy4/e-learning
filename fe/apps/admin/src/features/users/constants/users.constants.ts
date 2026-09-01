export const UserStatus = {
    PENDING: "PENDING",
    ACTIVE: "ACTIVE",
    BLOCKED: "BLOCKED",
    INACTIVE: "INACTIVE",
} as const;

export type UserStatus =
    (typeof UserStatus)[keyof typeof UserStatus];

export const userStatusLabel: Record<UserStatus, string> = {
    [UserStatus.PENDING]: "Đang chờ",
    [UserStatus.ACTIVE]: "Đang hoạt động",
    [UserStatus.BLOCKED]: "Đã chặn",
    [UserStatus.INACTIVE]: "Không hoạt động",
};

export const statusClassName: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]:
        "bg-green-100 text-green-700  dark:bg-green-900/30 dark:text-green-400",
    [UserStatus.PENDING]:
        "bg-yellow-100 text-yellow-700  dark:bg-yellow-900/30 dark:text-yellow-400",
    [UserStatus.BLOCKED]:
        "bg-red-100 text-red-700  dark:bg-red-900/30 dark:text-red-400",
    [UserStatus.INACTIVE]:
        "bg-gray-100 text-gray-600  dark:bg-gray-800 dark:text-gray-400",
};

export const UserRole = {
    STUDENT: "STUDENT",
    INSTRUCTOR: "INSTRUCTOR",
    ADMIN: "ADMIN",
} as const;

export type UserRole =
    (typeof UserRole)[keyof typeof UserRole];

export const userRoleLabel: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Admin",
    [UserRole.INSTRUCTOR]: "Giảng viên",
    [UserRole.STUDENT]: "Học viên",
};

export const roleClassName: Record<UserRole, string> = {
    [UserRole.ADMIN]:
        "bg-purple-100 text-purple-700  dark:bg-purple-900/30 dark:text-purple-400",
    [UserRole.INSTRUCTOR]:
        "bg-blue-100 text-blue-700  dark:bg-blue-900/30 dark:text-blue-400",
    [UserRole.STUDENT]:
        "bg-gray-100 text-gray-700  dark:bg-gray-800 dark:text-gray-400",
};
export const Gender = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER',
} as const;

export type Gender =
    (typeof Gender)[keyof typeof Gender];

export const genderLabel: Record<Gender, string> = {
    [Gender.MALE]: "Nam",
    [Gender.FEMALE]: "Nữ",
    [Gender.OTHER]: "Khac",
};