import { LessonType } from '@/modules/lessons/domain/enums/lesson-type.enum';

export class UpdateLessonCommand {
  constructor(
    public readonly id: number,
    public readonly data: {
      title?: string;
      type?: LessonType;
      videoProvider?: string | null;
      videoSource?: string | null;
      duration?: number | null;
      content?: string | null;
      position?: number;
      status?: number;
      isPreview?: boolean;
      video?: Express.Multer.File;
      /** Text sentinel từ FE: '' = xóa ảnh xem trước, không gửi = giữ nguyên */
      thumbnail?: string;
      /** File ảnh xem trước mới (thay thế ảnh cũ) */
      thumbnailFile?: Express.Multer.File;
    },
  ) {}
}
