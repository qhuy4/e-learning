import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteQuizCommand } from '../command/delete-quiz.command';
import { Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IQuizRepository, QUIZ_REPOSITORY } from '../../domain/repository/quiz.repository';

@CommandHandler(DeleteQuizCommand)
export class DeleteQuizHandler implements ICommandHandler<DeleteQuizCommand> {
  constructor(@Inject(QUIZ_REPOSITORY) private quizRepo: IQuizRepository) {}
  async execute(command: DeleteQuizCommand) {
    const quiz = await this.quizRepo.findById(Number(command.id));
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (command.userId && quiz.createdBy !== Number(command.userId)) throw new UnauthorizedException('You do not own this quiz');
    await this.quizRepo.delete(Number(command.id));
    return { success: true };
  }
}
