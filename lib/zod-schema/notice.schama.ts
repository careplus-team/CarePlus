import * as z from "zod";

export const noticeSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  content: z.string().min(20, "Content must be at least 20 characters long"),
  piority: z
    .string()
    .min(1, "Priority is required")
    .max(10, "Priority is too long"),
});
