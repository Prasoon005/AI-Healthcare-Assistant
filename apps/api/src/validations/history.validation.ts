import { z } from "zod";

export const HISTORY_RANGES = ["7d", "30d", "90d", "all"] as const;
export type HistoryRange = (typeof HISTORY_RANGES)[number];

export const HISTORY_EVENT_TYPES = [
  "all",
  "profile",
  "analysis",
  "report",
  "vital",
  "medication",
  "document",
  "followup",
] as const;
export type HistoryEventType = (typeof HISTORY_EVENT_TYPES)[number];

export const historyQuerySchema = z.object({
  type: z.enum(HISTORY_EVENT_TYPES).default("all"),
  range: z.enum(HISTORY_RANGES).default("all"),
  search: z
    .preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().trim().max(200).optional()
    ),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type HistoryQuery = z.infer<typeof historyQuerySchema>;

export const historyRecentQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

export const historyAnalyticsQuerySchema = z.object({
  range: z.enum(HISTORY_RANGES).default("30d"),
});

export const historyInsightSchema = z.object({
  insight: z.string(),
});

export type HistoryInsight = z.infer<typeof historyInsightSchema>;
