export class AttachQuizToLessonCommand { constructor(public readonly quizId: string, public readonly lessonId: string, public readonly userId: string | null) {} }
