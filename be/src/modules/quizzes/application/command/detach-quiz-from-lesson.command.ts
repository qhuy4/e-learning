export class DetachQuizFromLessonCommand { constructor(public readonly quizId: string, public readonly lessonId: string, public readonly userId: string | null) {} }
