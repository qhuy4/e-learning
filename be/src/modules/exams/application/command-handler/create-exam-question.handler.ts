import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateExamQuestionCommand } from '../command/create-exam-question.command';
import {
  IExamQuestionRepository,
  EXAM_QUESTION_REPOSITORY,
} from '../../domain/repository/exam-question.repository';
import {
  IExamOptionRepository,
  EXAM_OPTION_REPOSITORY,
} from '../../domain/repository/exam-option.repository';
import { ExamQuestion } from '../../domain/entity/exam-question.entity';
import { ExamOption } from '../../domain/entity/exam-option.entity';

@CommandHandler(CreateExamQuestionCommand)
export class CreateExamQuestionHandler
  implements ICommandHandler<CreateExamQuestionCommand>
{
  constructor(
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly examQuestionRepo: IExamQuestionRepository,
    @Inject(EXAM_OPTION_REPOSITORY)
    private readonly examOptionRepo: IExamOptionRepository,
  ) {}

  async execute(command: CreateExamQuestionCommand) {
    const question = ExamQuestion.create({
      sectionId: command.dto.sectionId,
      materialId: command.dto.materialId,
      questionTypeId: command.dto.questionTypeId,
      question: command.dto.question,
      explanation: command.dto.explanation,
      points: command.dto.points,
      position: command.dto.position,
    });

    const savedQuestion = await this.examQuestionRepo.save(question);

    if (command.dto.options && command.dto.options.length > 0) {
      const options = command.dto.options.map((o) =>
        ExamOption.create({
          questionId: savedQuestion.id!,
          content: o.content,
          isCorrect: o.isCorrect,
          position: o.position,
        }),
      );
      await this.examOptionRepo.saveAll(options);
    }

    return savedQuestion;
  }
}
