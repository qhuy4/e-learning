import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnswerQuestionCommand } from '@/modules/course-questions/application/command/answer-question.command';
import { CourseQuestionAnswerOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question-answer.orm-entity';
import { CourseQuestionOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question.orm-entity';

@CommandHandler(AnswerQuestionCommand)
export class AnswerQuestionHandler implements ICommandHandler<AnswerQuestionCommand> {
  constructor(
    @InjectRepository(CourseQuestionAnswerOrmEntity)
    private readonly answerRepo: Repository<CourseQuestionAnswerOrmEntity>,
    @InjectRepository(CourseQuestionOrmEntity)
    private readonly questionRepo: Repository<CourseQuestionOrmEntity>,
  ) {}

  async execute(command: AnswerQuestionCommand) {
    const { questionId, userId, content } = command;

    const answer = this.answerRepo.create({
      questionId: String(questionId),
      userId: String(userId),
      content,
      status: 1,
    });

    const saved = await this.answerRepo.save(answer);

    await this.questionRepo.update(questionId.toString(), {
      lastActivityAt: new Date(),
    });

    const result = await this.answerRepo.findOne({
      where: { id: saved.id.toString() },
      relations: { user: true },
    });

    return {
      id: Number(result!.id),
      questionId: Number(result!.questionId),
      userId: Number(result!.userId),
      content: result!.content,
      status: result!.status,
      createdAt: result!.createdAt,
      user: result!.user
        ? { id: Number(result!.user.id), name: result!.user.name }
        : undefined,
    };
  }
}
