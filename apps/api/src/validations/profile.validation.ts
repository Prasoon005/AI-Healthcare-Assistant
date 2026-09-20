import { z } from "zod";

const emptyToNull = (value: unknown) =>
  value === "" ? null : value;

export const updateProfileSchema = z.object({
  age: z
    .preprocess(
      emptyToNull,
      z.number().int().min(1).max(120).nullable()
    )
    .optional(),

  gender: z
    .preprocess(
      emptyToNull,
      z
        .enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"])
        .nullable()
    )
    .optional(),

  height: z
    .preprocess(
      emptyToNull,
      z.number().min(50).max(272).nullable()
    )
    .optional(),

  weight: z
    .preprocess(
      emptyToNull,
      z.number().min(2).max(500).nullable()
    )
    .optional(),

  smoking: z.boolean().nullable().optional(),

  alcohol: z.boolean().nullable().optional(),

  exerciseDays: z
    .preprocess(
      emptyToNull,
      z.number().int().min(0).max(7).nullable()
    )
    .optional(),

  sleepHours: z
    .preprocess(
      emptyToNull,
      z.number().min(0).max(24).nullable()
    )
    .optional(),

  allergies: z
    .preprocess(
      emptyToNull,
      z.string().trim().max(300).nullable()
    )
    .optional(),

  medicalConditions: z
    .preprocess(
      emptyToNull,
      z.string().trim().max(300).nullable()
    )
    .optional(),

  medications: z
    .preprocess(
      emptyToNull,
      z.string().trim().max(300).nullable()
    )
    .optional(),

  emergencyName: z
    .preprocess(
      emptyToNull,
      z.string().trim().max(100).nullable()
    )
    .optional(),

  emergencyPhone: z
    .preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .regex(/^[+]?[0-9\s-]{7,20}$/, "Enter a valid phone number")
        .nullable()
    )
    .optional(),
});

export type UpdateProfileInput = z.infer<
  typeof updateProfileSchema
>;
