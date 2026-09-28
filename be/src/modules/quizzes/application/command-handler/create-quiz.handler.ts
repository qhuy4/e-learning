import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuizCommand } from '../command/create-quiz.command';
import { Inject } from '@nestjs/common';
import { IQuizRepository, QUIZ_REPOSITORY } from '../../domain/repository/quiz.repository';
import { Quiz } from '../../domain/entity/quiz.entity';
import { QuizQuestionOrmEntity } from '../../infrastructure/entity/quiz-question.orm-entity';
import { QuizOptionOrmEntity } from '../../infrastructure/entity/quiz-option.orm-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@CommandHandler(CreateQuizCommand)
export class CreateQuizHandler implements ICommandHandler<CreateQuizCommand> {
  constructor(
    @Inject(QUIZ_REPOSITORY) private quizRepo: IQuizRepository,
    @InjectRepository(QuizQuestionOrmEntity) private readonly questionRepo: Repository<QuizQuestionOrmEntity>,
    @InjectRepository(QuizOptionOrmEntity) private readonly optionRepo: Repository<QuizOptionOrmEntity>
  ) {}
  async execute(command: CreateQuizCommand) {
    const quiz = Quiz.create({ ...command.dto, createdBy: command.createdBy ? Number(command.createdBy) : null });
    const savedQuiz = await this.quizRepo.create(quiz);

    if (command.dto.questions && command.dto.questions.length > 0) {
      for (const qDto of command.dto.questions) {
        const qEntity = this.questionRepo.create({
          quizId: savedQuiz.id!.toString(),
          question: qDto.question,
          type: qDto.type,
          audioUrl: qDto.audioUrl,
          imageUrl: qDto.imageUrl,
          explanation: qDto.explanation,
          points: qDto.points,
          position: qDto.position
        });
        const savedQuestion = await this.questionRepo.save(qEntity);
        if (qDto.options && qDto.options.length > 0) {
          const optEntities = qDto.options.map(o => this.optionRepo.create({
            questionId: savedQuestion.id,
            content: o.content,
            isCorrect: o.isCorrect,
            position: o.position
          }));
          await this.optionRepo.save(optEntities);
        }
      }
    }
    return savedQuiz;
  }
}
