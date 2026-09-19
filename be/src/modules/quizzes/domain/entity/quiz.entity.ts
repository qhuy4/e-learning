export class Quiz {
  private constructor(
    public id: number | null,
    public title: string,
    public description: string | null,
    public isPremium: boolean,
    public timeLimit: number | null,
    public passingScore: number,
    public maxAttempts: number,
    public shuffleQuestions: boolean,
    public shuffleOptions: boolean,
    public showAnswerAfterSubmit: boolean,
    public createdBy: number | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    title: string;
    description?: string | null;
    isPremium?: boolean;
    timeLimit?: number | null;
    passingScore?: number;
    maxAttempts?: number;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showAnswerAfterSubmit?: boolean;
    createdBy?: number | null;
  }): Quiz {
    return new Quiz(
      null,
      params.title,
      params.description ?? null,
      params.isPremium ?? false,
      params.timeLimit ?? null,
      params.passingScore ?? 0,
      params.maxAttempts ?? 1,
      params.shuffleQuestions ?? false,
      params.shuffleOptions ?? false,
      params.showAnswerAfterSubmit ?? true,
      params.createdBy ?? null,
      null,
      null
    );
  }

  static restore(params: {
    id: number;
    title: string;
    description: string | null;
    isPremium: boolean;
    timeLimit: number | null;
    passingScore: number;
    maxAttempts: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showAnswerAfterSubmit: boolean;
    createdBy: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): Quiz {
    return new Quiz(
      params.id, params.title, params.description, params.isPremium, params.timeLimit, params.passingScore,
      params.maxAttempts, params.shuffleQuestions, params.shuffleOptions, params.showAnswerAfterSubmit,
      params.createdBy, params.createdAt, params.updatedAt
    );
  }

  update(params: Partial<Quiz>) {
    if (params.title !== undefined) this.title = params.title;
    if (params.description !== undefined) this.description = params.description;
    if (params.isPremium !== undefined) this.isPremium = params.isPremium;
    if (params.timeLimit !== undefined) this.timeLimit = params.timeLimit;
    if (params.passingScore !== undefined) this.passingScore = params.passingScore;
    if (params.maxAttempts !== undefined) this.maxAttempts = params.maxAttempts;
    if (params.shuffleQuestions !== undefined) this.shuffleQuestions = params.shuffleQuestions;
    if (params.shuffleOptions !== undefined) this.shuffleOptions = params.shuffleOptions;
    if (params.showAnswerAfterSubmit !== undefined) this.showAnswerAfterSubmit = params.showAnswerAfterSubmit;
  }
}
