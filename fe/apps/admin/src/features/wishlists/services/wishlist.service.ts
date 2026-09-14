import type {
  PaginatedWishlistResponse,
  Wishlist,
} from "../types/wishlist";
import { adminApi } from "@/shared/lib/axios.ts";

export const wishlistService = {
  list: async (params: {
    page: number;
    limit: number;
    keyword?: string;
  }): Promise<PaginatedWishlistResponse> => {
    const response = await adminApi.get<PaginatedWishlistResponse>("/wishlists", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Wishlist> => {
    const response = await adminApi.get(`/wishlists/${id}`);
    return response.data.data;
  },

  remove: async (id: number): Promise<void> => {
    await adminApi.delete(`/wishlists/${id}`);
  },

  removeItem: async (wishlistId: number, itemId: number): Promise<void> => {
    await adminApi.delete(`/wishlists/${wishlistId}/items/${itemId}`);
  },
};
