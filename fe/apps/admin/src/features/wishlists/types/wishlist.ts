export interface WishlistUser {
  id: number;
  name: string;
  email?: string;
}

export interface WishlistCourse {
  id: number;
  title: string;
  thumbnail?: string;
}

export interface WishlistItem {
  id: number;
  courseId: number;
  addedAt: string;
  note: string | null;
  course?: WishlistCourse;
}

export interface Wishlist {
  id: number;
  userId: number;
  name: string;
  isDefault: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt?: string;
  user?: WishlistUser;
  items?: WishlistItem[];
}

export interface PaginatedWishlistResponse {
  data: Wishlist[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
