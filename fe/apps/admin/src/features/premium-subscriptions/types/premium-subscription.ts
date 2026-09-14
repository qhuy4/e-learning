export interface SubscriptionUser {
  id: number;
  name: string;
  email?: string;
}

export interface PremiumSubscription {
  id: number;
  userId: number;
  startedAt: string;
  expiredAt: string;
  status: number;
  createdAt: string;
  updatedAt?: string;
  user?: SubscriptionUser;
}

export const subscriptionStatusLabel: Record<number, string> = {
  0: "Hết hạn",
  1: "Đang active",
  2: "Tạm dừng",
};

export const subscriptionStatusClassName: Record<number, string> = {
  0: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  2: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export interface PaginatedSubscriptionResponse {
  data: PremiumSubscription[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
