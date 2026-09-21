import api from "./axios";

export type HistoryRange = "7d" | "30d" | "90d" | "all";

export const HISTORY_RANGE_OPTIONS: { value: HistoryRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

export type HistoryEventType =
  | "all"
  | "profile"
  | "analysis"
  | "report"
  | "vital"
  | "medication"
  | "document"
  | "followup";

export const HISTORY_TYPE_OPTIONS: { value: HistoryEventType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "report", label: "Reports" },
  { value: "analysis", label: "Analyses" },
  { value: "vital", label: "Vitals" },
  { value: "medication", label: "Medications" },
  { value: "document", label: "Documents" },
  { value: "profile", label: "Profile" },
  { value: "followup", label: "Follow-ups" },
];

export interface HistoryEvent {
  id: string;
  type: Exclude<HistoryEventType, "all">;
  title: string;
  description: string;
  occurredAt: string;
  link: { type: "analysis" | "report" | "document"; id: string } | null;
}

export interface HistoryPage {
  events: HistoryEvent[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface GetHistoryParams {
  type?: HistoryEventType;
  range?: HistoryRange;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const getHistory = async (
  params: GetHistoryParams = {}
): Promise<HistoryPage> => {
  const response = await api.get<{ success: boolean; data: HistoryPage }>(
    "/history",
    { params }
  );

  return response.data.data;
};

export const getRecentActivity = async (
  limit = 5
): Promise<HistoryEvent[]> => {
  const response = await api.get<{ success: boolean; data: HistoryEvent[] }>(
    "/history/recent",
    { params: { limit } }
  );

  return response.data.data;
};

export interface VitalTrendPoint {
  date: string;
  value: number;
}

export interface VitalTrends {
  heartRate: VitalTrendPoint[];
  systolic: VitalTrendPoint[];
  diastolic: VitalTrendPoint[];
  spo2: VitalTrendPoint[];
}

export interface ActivityVolume {
  analyses: number;
  reports: number;
  vitals: number;
  documents: number;
  medications: number;
  followups: number;
}

export interface MedicationTracking {
  activeMedications: number;
  totalMedicationsTracked: number;
  dosesScheduled: number;
  dosesTaken: number;
}

export interface ConcernStatus {
  resolved: number;
  improved: number;
  persistent: number;
  worsening: number;
  unknown: number;
}

export interface HealthTrackingProgressItem {
  key: string;
  label: string;
  value: number;
  max: number;
}

export interface HealthTrackingProgress {
  label: string;
  score: number;
  disclaimer: string;
  breakdown: HealthTrackingProgressItem[];
}

export interface HistoryAnalytics {
  range: HistoryRange;
  periodStart: string | null;
  periodEnd: string;
  activityVolume: ActivityVolume;
  vitalTrends: VitalTrends;
  medicationTracking: MedicationTracking;
  concernStatus: ConcernStatus;
  healthTrackingProgress: HealthTrackingProgress;
  aiInsight: { available: boolean; text: string | null };
}

export const getAnalytics = async (
  range: HistoryRange
): Promise<HistoryAnalytics> => {
  const response = await api.get<{ success: boolean; data: HistoryAnalytics }>(
    "/history/analytics",
    { params: { range } }
  );

  return response.data.data;
};
