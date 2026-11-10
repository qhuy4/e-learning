export class GetCatalogCoursesQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 12,
    public readonly keyword?: string,
    public readonly levels?: number[],
    public readonly price?: 'all' | 'free' | 'paid',
    public readonly minPrice?: number,
    public readonly maxPrice?: number,
    public readonly minRating?: number,
    public readonly sort?: 'popular' | 'newest' | 'price-asc' | 'price-desc',
  ) {}
}
