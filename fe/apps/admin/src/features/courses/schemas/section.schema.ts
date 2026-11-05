import { z } from "zod";

export const sectionSchema = z.object({
  title: z
    .string({ error: "Vui lòng nhập tên chðơng." })
    .trim()
    .min(1, "Vui lòng nhập tên chương.")
    .max(255, "Tên chðơng không được vượt quá 255 ký tự."),
});

export const validateSection = (data: any) => {
  const result = sectionSchema.safeParse(data);
  if (!result.success) {
    return result.error.issues[0].message;
  }
  return null;
};
