import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AttachQuizToLessonCommand } from '../command/attach-quiz-to-lesson.command';
import { Inject, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ILessonQuizRepository, LESSON_QUIZ_REPOSITORY } from '../../domain/repository/lesson-quiz.repository';
import { LessonQuiz } from '../../domain/entity/lesson-quiz.entity';
import { IQuizRepository, QUIZ_REPOSITORY } from '../../domain/repository/quiz.repository';

@CommandHandler(AttachQuizToLessonCommand)
export class AttachQuizToLessonHandler implements ICommandHandler<AttachQuizToLessonCommand> {
  constructor(
    @Inject(LESSON_QUIZ_REPOSITORY) private lessonQuizRepo: ILessonQuizRepository,
    @Inject(QUIZ_REPOSITORY) private quizRepo: IQuizRepository,
  ) {}
  async execute(command: AttachQuizToLessonCommand) {
    const quiz = await this.quizRepo.findById(Number(command.quizId));
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (command.userId && quiz.createdBy !== Number(command.userId)) throw new UnauthorizedException('You do not own this quiz');
    
    const entity = LessonQuiz.create({ lessonId: Number(command.lessonId), quizId: Number(command.quizId) });
    return this.lessonQuizRepo.create(entity);
  }
}
