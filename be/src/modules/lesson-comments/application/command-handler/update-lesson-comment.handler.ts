import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { UpdateLessonCommentCommand } from '../command/update-lesson-comment.command';
import {
  ILessonCommentRepository,
  LESSON_COMMENT_REPOSITORY,
} from '../../domain/repository/lesson-comment.repository';
import { LessonComment } from '../../domain/entity/lesson-comment.entity';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(UpdateLessonCommentCommand)
export class UpdateLessonCommentHandler
  implements ICommandHandler<UpdateLessonCommentCommand>
{
  constructor(
    @Inject(LESSON_COMMENT_REPOSITORY)
    private readonly lessonCommentRepository: ILessonCommentRepository,
  ) {}

  async execute(command: UpdateLessonCommentCommand): Promise<LessonComment> {
    const existing = await this.lessonCommentRepository.findById(
      command.commentId,
    );
    // Chỉ sửa được bình luận của chính mình (bigint pg trả string → Number()).
    if (!existing || Number(existing.userId) !== command.userId) {
      throw new AppException(
        ErrorCode.LESSON_COMMENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    existing.updateContent(command.content);
    return this.lessonCommentRepository.update(existing);
  }
}
