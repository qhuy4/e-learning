export class ReviewDtoMapper {
  static toDto(entity: any) {
    if (!entity) return null;

    return {
      id: String(entity.id),
      userId: String(entity.userId),
      courseId: String(entity.courseId),
      rating: Number(entity.rating),
      comment: entity.comment ?? null,
      status: Number(entity.status ?? 1),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      user: entity.user
        ? {
            id: Number(entity.user.id),
            name: entity.user.name ?? 'Học viên',
            avatarUrl: entity.user.profile?.avatarUrl ?? null,
          }
        : null,
      images: (entity.images || []).map((img: any) => ({
        id: String(img.id),
        reviewId: String(img.reviewId),
        imageUrl: img.imageUrl,
        createdAt: img.createdAt,
      })),
    };
  }

  static toDtoList(entities: any[]) {
    return (entities || []).map((entity) => this.toDto(entity));
  }
}
