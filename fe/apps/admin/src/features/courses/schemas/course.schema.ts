import { z } from "zod";

export const createCourseSchema = z.object({
  title: z
    .string({ error: "Vui lòng nhập tên khóa học." })
    .trim()
    .min(1, "Vui lòng nhập tên khóa học.")
    .max(255, "Tên khóa học không được vượt quá 255 ký tự."),
  price: z.coerce
    .number()
    .min(0, "Giá tiền không được nhỏ hơn 0.")
    .optional()
    .default(0),
  level: z.coerce.number().optional().default(1),
  categoryId: z.coerce.number().optional().default(1),
  thumbnail: z
    .any()
    .refine((val) => val !== undefined && val !== null && val !== "", {
      message: "Vui lòng chọn hình đại diện khóa học.",
    }),
});

export const editCourseSchema = z.object({
  title: z
    .string({ error: "Vui lòng nhập tên khóa học." })
    .trim()
    .min(1, "Vui lòng nhập tên khóa học.")
    .max(255, "Tên khóa học không được vượt quá 255 ký tự."),
  price: z.coerce
    .number()
    .min(0, "Giá tiền không được nhỏ hơn 0.")
    .optional()
    .default(0),
  level: z.coerce.number().optional().default(1),
  categoryId: z.coerce.number().optional().default(1),
});

const getFirstIssue = (result: z.ZodSafeParseResult<unknown>) =>
  !result.success ? result.error.issues[0].message : null;

export const validateCourse = (data: any) =>
  getFirstIssue(createCourseSchema.safeParse(data));

export const validateCourseEdit = (data: any) =>
  getFirstIssue(editCourseSchema.safeParse(data));
