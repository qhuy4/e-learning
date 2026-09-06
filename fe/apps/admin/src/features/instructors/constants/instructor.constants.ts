export const ApprovalStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    SUSPENDED: "SUSPENDED",
} as const;

export type ApprovalStatus =
    (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

export const approvalStatusLabel: Record<ApprovalStatus, string> = {
    [ApprovalStatus.PENDING]: "Chờ duyệt",
    [ApprovalStatus.APPROVED]: "Đã duyệt",
    [ApprovalStatus.SUSPENDED]: "Đã đình chỉ",
};

export const approvalStatusClassName: Record<ApprovalStatus, string> = {
    [ApprovalStatus.PENDING]:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    [ApprovalStatus.APPROVED]:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    [ApprovalStatus.SUSPENDED]:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
