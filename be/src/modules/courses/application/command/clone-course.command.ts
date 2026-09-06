import { ICommand } from '@nestjs/cqrs';

export class CloneCourseCommand implements ICommand {
  constructor(public readonly courseId: number) {}
}
