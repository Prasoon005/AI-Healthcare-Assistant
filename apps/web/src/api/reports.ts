import api from "./axios";
import type { Gender } from "./profile";

export type ReportRange = "7d" | "30d" | "90d" | "all";

export const REPORT_RANGE_OPTIONS: { value: ReportRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

export type FollowUpQuestionType = "medication" | "concern";

export interface FollowUpQuestionOption {
  value: string;
  label: string;
}

export interface FollowUpQuestion {
  questionId: string;
  type: FollowUpQuestionType;
  refId: string;
  refLabel: string;
  prompt: string;
  options: FollowUpQuestionOption[];
}

export interface FollowUpAnswer {
  questionId: string;
  type: FollowUpQuestionType;
  refId: string;
  status: string;
}

export interface MetricSummary {
  count: number;
  avg: number | null;
  min: number | null;
  max: number | null;
  latest: number | null;
  latestAt: string | null;
}

export interface VitalsSummary {
  recordCount: number;
  heartRate: MetricSummary;
  systolic: MetricSummary;
  diastolic: MetricSummary;
  spo2: MetricSummary;
}

export interface WellnessSnapshotItem {
  key: string;
  label: string;
  score: number;
  level: "low" | "moderate" | "high";
  description: string;
}

export interface WellnessSnapshot {
  available: boolean;
  completeness: number;
  overallWellnessScore: number | null;
  items: WellnessSnapshotItem[];
  disclaimer?: string;
}

export interface ReportAnalysisSummary {
  id: string;
  concern: string;
  duration: string;
  severity: string;
  urgencyLevel: "routine" | "soon" | "urgent";
  summary: string;
  createdAt: string;
}

export interface ReportMedicationSummary {
  id: string;
  name: string;
  dosage: string;
  instructions: string | null;
}

export interface ReportDocumentSummary {
  id: string;
  name: string;
  mimeType: string;
  hasExtractedText: boolean;
  createdAt: string;
}

export interface ReportProfileSnapshot {
  age: number | null;
  gender: Gender | null;
  height: number | null;
  weight: number | null;
  smoking: boolean | null;
  alcohol: boolean | null;
  exerciseDays: number | null;
  sleepHours: number | null;
  allergies: string | null;
  medicalConditions: string | null;
  medications: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
}

export interface ReportContent {
  patientOverview: string;
  profileSummary: string;
  healthHistory: string;
  previousAnalyses: string;
  currentHealthStatus: string;
  vitalsSummary: string;
  medicationSummary: string;
  previousConcernsStatus: string;
  medicalDocumentsSummary: string;
  currentObservations: string;
  persistentConcerns: string;
  generalWellnessConsiderations: string;
  suggestedFollowUpTopics: string[];
  questionsForDoctor: string[];
  disclaimer: string;
}

export interface ReportQuestionEntry {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface HealthReportSummary {
  id: string;
  rangeKey: ReportRange;
  periodStart: string | null;
  periodEnd: string;
  createdAt: string;
}

export interface HealthReport extends HealthReportSummary {
  profileSnapshot: ReportProfileSnapshot | null;
  vitalsSummary: VitalsSummary;
  wellnessSnapshot: WellnessSnapshot;
  analysesSummary: ReportAnalysisSummary[];
  medicationsSummary: ReportMedicationSummary[];
  documentsSummary: ReportDocumentSummary[];
  followUpAnswers: (FollowUpAnswer & { answeredAt: string })[];
  reportContent: ReportContent;
  questions: ReportQuestionEntry[];
}

export const getFollowUpQuestions = async (): Promise<FollowUpQuestion[]> => {
  const response = await api.get<{ success: boolean; data: FollowUpQuestion[] }>(
    "/reports/follow-up-questions"
  );

  return response.data.data;
};

export interface GenerateReportInput {
  range: ReportRange;
  followUpAnswers: FollowUpAnswer[];
  documentIds: string[];
}

export const generateHealthReport = async (
  input: GenerateReportInput
): Promise<HealthReport> => {
  const response = await api.post<{ success: boolean; data: HealthReport }>(
    "/reports",
    input
  );

  return response.data.data;
};

export const getHealthReports = async (): Promise<HealthReportSummary[]> => {
  const response = await api.get<{
    success: boolean;
    data: HealthReportSummary[];
  }>("/reports");

  return response.data.data;
};

export const getLatestHealthReport = async (): Promise<{
  report: HealthReportSummary | null;
}> => {
  const response = await api.get<{
    success: boolean;
    data: { report: HealthReportSummary | null };
  }>("/reports/latest");

  return response.data.data;
};

export const getHealthReport = async (id: string): Promise<HealthReport> => {
  const response = await api.get<{ success: boolean; data: HealthReport }>(
    `/reports/${id}`
  );

  return response.data.data;
};

export const askAboutReport = async (
  id: string,
  question: string
): Promise<ReportQuestionEntry> => {
  const response = await api.post<{
    success: boolean;
    data: ReportQuestionEntry;
  }>(`/reports/${id}/questions`, { question });

  return response.data.data;
};
