export class GetCourseQuestionsQuery {
  constructor(
    public readonly courseId: number,
    public readonly options: {
      page: number;
      limit: number;
      status?: number;
    },
  ) {}
}
