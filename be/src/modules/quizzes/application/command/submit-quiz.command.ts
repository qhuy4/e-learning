import { SubmitQuizDto } from '../../presentation/dto/submit-quiz.dto';
export class SubmitQuizCommand { constructor(public readonly attemptId: string, public readonly userId: string, public readonly dto: SubmitQuizDto) {} }
