export class GetInstructorQuestionsQuery {
  constructor(
    public readonly instructorId: number,
    public readonly options: {
      page: number;
      limit: number;
      courseId?: number;
      status?: number;
      keyword?: string;
    },
  ) {}
}
