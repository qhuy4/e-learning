import { z } from "zod";

export const lessonSchema = z.object({
  title: z
    .string({ required_error: "Vui lòng nhập tên bài học." })
    .trim()
    .min(1, "Vui lòng nhập tên bài học.")
    .max(255, "Tên bài học không được vượt quá 255 ký tự."),
  duration: z.coerce.number().min(0, "Thời lượng phải lớn hơn hoặc bằng 0.").optional(),
});

export const validateLesson = (data: any) => {
  const result = lessonSchema.safeParse(data);
  if (!result.success) {
    return result.error.issues[0].message;
  }
  return null;
};