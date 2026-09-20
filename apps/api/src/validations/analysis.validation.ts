import { z } from "zod";

export const createAnalysisSchema = z.object({
  concern: z.string().trim().min(3).max(500),

  duration: z.enum([
    "less_than_a_day",
    "a_few_days",
    "about_a_week",
    "several_weeks",
    "a_month_or_more",
  ]),

  severity: z.enum(["mild", "moderate", "severe"]),

  additionalContext: z
    .preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().trim().max(500).optional()
    ),
});

export type CreateAnalysisInput = z.infer<
  typeof createAnalysisSchema
>;

export const analysisFeedbackSchema = z.object({
  helpful: z.boolean(),
});

export type AnalysisFeedbackInput = z.infer<
  typeof analysisFeedbackSchema
>;

export const aiResultSchema = z.object({
  summary: z.string(),
  considerations: z.array(z.string()),
  generalGuidance: z.array(z.string()),
  selfCareMeasures: z.array(z.string()),
  thingsToMonitor: z.array(z.string()),
  whenToSeekCare: z.array(z.string()),
  questionsForDoctor: z.array(z.string()),
  disclaimer: z.string(),
  urgencyLevel: z.enum(["routine", "soon", "urgent"]),
});

export type AIResult = z.infer<typeof aiResultSchema>;

export const quickCheckSchema = z.object({
  symptom: z.string().trim().min(2).max(100),
});

export type QuickCheckInput = z.infer<typeof quickCheckSchema>;

export const quickCheckResultSchema = z.object({
  recognized: z.boolean(),
  needsFullAnalysis: z.boolean(),
  summary: z.string(),
  considerations: z.array(z.string()),
  generalGuidance: z.array(z.string()),
  whenToSeekCare: z.array(z.string()),
  urgencyLevel: z.enum(["routine", "soon", "urgent"]),
  disclaimer: z.string(),
});

export type QuickCheckResult = z.infer<typeof quickCheckResultSchema>;
