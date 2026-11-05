export class GetLessonCommentThreadQuery {
  constructor(
    public readonly instructorId: number,
    /** Id bình luận gốc cần xem chi tiết */
    public readonly rootId: number,
  ) {}
}
