import { z } from "zod";

export const createVitalSchema = z
  .object({
    heartRate: z
      .number()
      .int()
      .min(1)
      .max(300)
      .optional(),

    systolic: z
      .number()
      .int()
      .min(1)
      .max(300)
      .optional(),

    diastolic: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional(),

    spo2: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional(),
  })
  .refine(
    (data) =>
      data.heartRate !== undefined ||
      data.systolic !== undefined ||
      data.diastolic !== undefined ||
      data.spo2 !== undefined,
    {
      message: "At least one vital sign is required",
    }
  );

export type CreateVitalInput = z.infer<
  typeof createVitalSchema
>;