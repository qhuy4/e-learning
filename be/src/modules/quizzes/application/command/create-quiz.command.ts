import { CreateQuizDto } from '../../presentation/dto/create-quiz.dto';
export class CreateQuizCommand { constructor(public readonly dto: CreateQuizDto, public readonly createdBy: string) {} }
