import { IQuery } from "@nestjs/cqrs";
export class GetLessonByIdQuery implements IQuery {
  constructor(public readonly id: number) {}
}
