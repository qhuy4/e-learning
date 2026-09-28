import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateQuizCommand } from '../command/update-quiz.command';
import { Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IQuizRepository, QUIZ_REPOSITORY } from '../../domain/repository/quiz.repository';
import { QuizQuestionOrmEntity } from '../../infrastructure/entity/quiz-question.orm-entity';
import { QuizOptionOrmEntity } from '../../infrastructure/entity/quiz-option.orm-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@CommandHandler(UpdateQuizCommand)
export class UpdateQuizHandler implements ICommandHandler<UpdateQuizCommand> {
  constructor(
    @Inject(QUIZ_REPOSITORY) private quizRepo: IQuizRepository,
    @InjectRepository(QuizQuestionOrmEntity) private readonly questionRepo: Repository<QuizQuestionOrmEntity>,
    @InjectRepository(QuizOptionOrmEntity) private readonly optionRepo: Repository<QuizOptionOrmEntity>
  ) {}
  async execute(command: UpdateQuizCommand) {
    const quiz = await this.quizRepo.findById(Number(command.id));
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (command.userId && quiz.createdBy !== Number(command.userId)) throw new UnauthorizedException('You do not own this quiz');
    
    quiz.update(command.dto);
    const savedQuiz = await this.quizRepo.update(quiz);

    if (command.dto.questions !== undefined) {
      // Clear old questions
      const oldQuestions = await this.questionRepo.find({ where: { quizId: savedQuiz.id!.toString() } });
      if (oldQuestions.length > 0) {
        // Options will cascade delete if DB setup properly, but we can delete manually to be safe
        const qIds = oldQuestions.map(q => q.id);
        const qIdsString = qIds.map(id => id.toString());
        await this.optionRepo.createQueryBuilder().delete().where("question_id IN (:...ids)", { ids: qIdsString }).execute();
        await this.questionRepo.delete({ quizId: savedQuiz.id!.toString() });
      }

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
    }

    return savedQuiz;
  }
}
