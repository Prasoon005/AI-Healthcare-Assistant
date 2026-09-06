import { z } from "zod";

export const createMedicationSchema = z.object({
  name: z.string().trim().min(1, "Medicine name is required"),
  dosage: z.string().trim().min(1, "Dosage is required"),
  instructions: z.string().trim().optional(),
  times: z
    .array(z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"))
    .min(1, "At least one reminder time is required"),
});

export const medicationLogSchema = z.object({
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export type CreateMedicationInput = z.infer<
  typeof createMedicationSchema
>;