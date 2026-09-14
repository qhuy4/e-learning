import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "@/features/wishlists/services/wishlist.service";

export const wishlistKeys = {
  all: ["wishlists"] as const,
  lists: () => [...wishlistKeys.all, "list"] as const,
  list: (page: number, limit: number, keyword?: string) =>
    [...wishlistKeys.lists(), { page, limit, keyword }] as const,
  details: () => [...wishlistKeys.all, "detail"] as const,
  detail: (id: number) => [...wishlistKeys.details(), id] as const,
};

export function useWishlists(page: number, limit: number, keyword?: string) {
  return useQuery({
    queryKey: wishlistKeys.list(page, limit, keyword),
    queryFn: () => wishlistService.list({ page, limit, keyword }),
  });
}

export function useWishlist(id: number) {
  return useQuery({
    queryKey: wishlistKeys.detail(id),
    queryFn: () => wishlistService.getById(id),
    enabled: !!id,
  });
}

export function useDeleteWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => wishlistService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
    },
  });
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ wishlistId, itemId }: { wishlistId: number; itemId: number }) =>
      wishlistService.removeItem(wishlistId, itemId),
    onSuccess: (_data, { wishlistId }) => {
      void queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: wishlistKeys.detail(wishlistId) });
    },
  });
}
