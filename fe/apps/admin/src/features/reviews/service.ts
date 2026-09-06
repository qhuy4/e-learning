import type {PaginationResponse} from "@/shared/types/pagination.ts";
import type {Review} from "@/features/reviews/types/review.ts";
import {adminApi} from "@/shared/lib/axios.ts";

export const reviewService = {
    async getReviews(
        page: number,
        limit: number,
        search?: string,
        sortBy?: string,
        sortOrder?: string,
    ): Promise<PaginationResponse<Review>> {
        const response = await adminApi.get<PaginationResponse<Review>>("/reviews/", {
            params: {
                page,
                limit,
                ...(search && {search}),
                ...(sortBy && {sortBy}),
                ...(sortOrder && {sortOrder}),
            }
        });
        return response.data;
    },

    async updateStatus(id: string, status: number): Promise<Review> {
        const response = await adminApi.patch<Review>(`/reviews/${id}/status`, null, {
            params: {status}
        });
        return response.data;
    },
};
