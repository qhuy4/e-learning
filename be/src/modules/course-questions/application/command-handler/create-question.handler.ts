import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuestionCommand } from '@/modules/course-questions/application/command/create-question.command';
import { CourseQuestionOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question.orm-entity';

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionHandler implements ICommandHandler<CreateQuestionCommand> {
  constructor(
    @InjectRepository(CourseQuestionOrmEntity)
    private readonly questionRepo: Repository<CourseQuestionOrmEntity>,
  ) {}

  async execute(command: CreateQuestionCommand) {
    const { courseId, userId, content } = command;

    const question = this.questionRepo.create({
      courseId: String(courseId),
      userId: String(userId),
      content,
      status: 1,
      lastActivityAt: new Date(),
    });

    const saved = await this.questionRepo.save(question);

    const result = await this.questionRepo.findOne({
      where: { id: saved.id.toString() },
      relations: { course: true, user: true },
    });

    return {
      id: Number(result!.id),
      courseId: Number(result!.courseId),
      userId: Number(result!.userId),
      content: result!.content,
      status: result!.status,
      lastActivityAt: result!.lastActivityAt,
      createdAt: result!.createdAt,
      course: result!.course
        ? { id: Number(result!.course.id), title: result!.course.title }
        : undefined,
      user: result!.user
        ? { id: Number(result!.user.id), name: result!.user.name }
        : undefined,
      answerCount: 0,
    };
  }
}
