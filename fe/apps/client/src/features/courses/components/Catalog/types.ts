export interface CatalogCourse {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  level: number;
  price: number;
  instructorName: string | null;
  instructorAvatar: string | null;
  avgRating: number;
  reviewCount: number;
}

export interface FilterState {
  categories: string[];
  levels: number[];
  price: "all" | "free" | "paid";
  minRating: number;
}
