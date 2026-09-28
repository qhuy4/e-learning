import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DetachQuizFromLessonCommand } from '../command/detach-quiz-from-lesson.command';
import { Inject, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ILessonQuizRepository, LESSON_QUIZ_REPOSITORY } from '../../domain/repository/lesson-quiz.repository';
import { IQuizRepository, QUIZ_REPOSITORY } from '../../domain/repository/quiz.repository';

@CommandHandler(DetachQuizFromLessonCommand)
export class DetachQuizFromLessonHandler implements ICommandHandler<DetachQuizFromLessonCommand> {
  constructor(
    @Inject(LESSON_QUIZ_REPOSITORY) private lessonQuizRepo: ILessonQuizRepository,
    @Inject(QUIZ_REPOSITORY) private quizRepo: IQuizRepository,
  ) {}
  async execute(command: DetachQuizFromLessonCommand) {
    const quiz = await this.quizRepo.findById(Number(command.quizId));
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (command.userId && quiz.createdBy !== Number(command.userId)) throw new UnauthorizedException('You do not own this quiz');
    
    await this.lessonQuizRepo.delete(Number(command.lessonId), Number(command.quizId));
    return { success: true };
  }
}
