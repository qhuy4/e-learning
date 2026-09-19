import { UpdateQuizDto } from '../../presentation/dto/update-quiz.dto';
export class UpdateQuizCommand { constructor(public readonly id: string, public readonly userId: string | null, public readonly dto: UpdateQuizDto) {} }
