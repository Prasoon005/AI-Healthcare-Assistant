import { z } from "zod";

export const FEEDBACK_CATEGORIES = ["BUG", "IDEA", "OTHER"] as const;

export const createFeedbackSchema = z.object({
  message: z.string().trim().min(5, "Please write a few more words").max(1000),
  category: z.enum(FEEDBACK_CATEGORIES).optional(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
