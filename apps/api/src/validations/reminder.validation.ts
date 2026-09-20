import { z } from "zod";

export const createReminderSchema = z.object({
  title: z.string().trim().min(2).max(150),

  note: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().max(300).optional()
  ),

  dueDate: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Enter a valid date",
    }),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
