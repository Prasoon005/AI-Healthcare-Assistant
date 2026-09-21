import { z } from "zod";

export const REPORT_RANGES = ["7d", "30d", "90d", "all"] as const;
export type ReportRange = (typeof REPORT_RANGES)[number];

export const MEDICATION_FOLLOWUP_STATUSES = [
  "completed",
  "still_taking",
  "stopped_early",
  "not_sure",
] as const;

export const CONCERN_FOLLOWUP_STATUSES = [
  "resolved",
  "improved",
  "still_present",
  "worse",
  "not_sure",
] as const;

export const followUpAnswerSchema = z.discriminatedUnion("type", [
  z.object({
    questionId: z.string().min(1),
    type: z.literal("medication"),
    refId: z.string().min(1),
    status: z.enum(MEDICATION_FOLLOWUP_STATUSES),
  }),
  z.object({
    questionId: z.string().min(1),
    type: z.literal("concern"),
    refId: z.string().min(1),
    status: z.enum(CONCERN_FOLLOWUP_STATUSES),
  }),
]);

export type FollowUpAnswerInput = z.infer<typeof followUpAnswerSchema>;

export const generateReportSchema = z.object({
  range: z.enum(REPORT_RANGES),
  followUpAnswers: z.array(followUpAnswerSchema).max(30).default([]),
  documentIds: z.array(z.string().min(1)).max(10).default([]),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;

export const reportQuestionSchema = z.object({
  question: z.string().trim().min(3).max(300),
});

export type ReportQuestionInput = z.infer<typeof reportQuestionSchema>;

export const reportContentSchema = z.object({
  patientOverview: z.string(),
  profileSummary: z.string(),
  healthHistory: z.string(),
  previousAnalyses: z.string(),
  currentHealthStatus: z.string(),
  vitalsSummary: z.string(),
  medicationSummary: z.string(),
  previousConcernsStatus: z.string(),
  medicalDocumentsSummary: z.string(),
  currentObservations: z.string(),
  persistentConcerns: z.string(),
  generalWellnessConsiderations: z.string(),
  suggestedFollowUpTopics: z.array(z.string()),
  questionsForDoctor: z.array(z.string()),
  disclaimer: z.string(),
});

export type ReportContent = z.infer<typeof reportContentSchema>;

export const reportQAResponseSchema = z.object({
  answer: z.string(),
});

export type ReportQAResponse = z.infer<typeof reportQAResponseSchema>;
