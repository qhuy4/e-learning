import { MaxLength, MinLength } from 'class-validator';

export class AnalyzeWritingDto {
  /** 80–4000 ký tự: khớp giới hạn vocab (/free-text) và grammar (max_text_chars). */
  @MinLength(80, { message: 'Bài viết cần ít nhất 80 ký tự' })
  @MaxLength(4000, { message: 'Bài viết tối đa 4000 ký tự' })
  text: string;
}
