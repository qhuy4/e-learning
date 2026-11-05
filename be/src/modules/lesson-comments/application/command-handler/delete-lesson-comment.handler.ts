import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { DeleteLessonCommentCommand } from '../command/delete-lesson-comment.command';
import {
  ILessonCommentRepository,
  LESSON_COMMENT_REPOSITORY,
} from '../../domain/repository/lesson-comment.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(DeleteLessonCommentCommand)
export class DeleteLessonCommentHandler
  implements ICommandHandler<DeleteLessonCommentCommand>
{
  constructor(
    @Inject(LESSON_COMMENT_REPOSITORY)
    private readonly lessonCommentRepository: ILessonCommentRepository,
  ) {}

  async execute(
    command: DeleteLessonCommentCommand,
  ): Promise<{ success: true }> {
    const existing = await this.lessonCommentRepository.findById(
      command.commentId,
    );
    // Chỉ xóa được bình luận của chính mình (bigint pg trả string → Number(); con theo cha nhờ CASCADE).
    if (!existing || Number(existing.userId) !== command.userId) {
      throw new AppException(
        ErrorCode.LESSON_COMMENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.lessonCommentRepository.delete(command.commentId);
    return { success: true };
  }
}
