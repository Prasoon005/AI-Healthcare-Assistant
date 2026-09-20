import api from "./axios";

export type AnalysisDuration =
  | "less_than_a_day"
  | "a_few_days"
  | "about_a_week"
  | "several_weeks"
  | "a_month_or_more";

export type AnalysisSeverity = "mild" | "moderate" | "severe";

export type UrgencyLevel = "routine" | "soon" | "urgent";

export interface AIAnalysisResult {
  summary: string;
  considerations: string[];
  generalGuidance: string[];
  selfCareMeasures: string[];
  thingsToMonitor: string[];
  whenToSeekCare: string[];
  questionsForDoctor: string[];
  disclaimer: string;
  urgencyLevel: UrgencyLevel;
}

export interface HealthAnalysis {
  id: string;
  concern: string;
  duration: AnalysisDuration;
  severity: AnalysisSeverity;
  additionalContext: string | null;
  urgencyLevel: UrgencyLevel;
  hasPhoto: boolean;
  helpful: boolean | null;
  aiResult: AIAnalysisResult;
  createdAt: string;
}

export interface CreateAnalysisInput {
  concern: string;
  duration: AnalysisDuration;
  severity: AnalysisSeverity;
  additionalContext?: string;
  photo?: File;
}

export const createHealthAnalysis = async (
  input: CreateAnalysisInput
): Promise<HealthAnalysis> => {
  const formData = new FormData();

  formData.append("concern", input.concern);
  formData.append("duration", input.duration);
  formData.append("severity", input.severity);

  if (input.additionalContext) {
    formData.append("additionalContext", input.additionalContext);
  }

  if (input.photo) {
    formData.append("photo", input.photo);
  }

  const response = await api.post<{
    success: boolean;
    data: HealthAnalysis;
  }>("/analysis", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.data;
};

export const getHealthAnalysis = async (
  id: string
): Promise<HealthAnalysis> => {
  const response = await api.get<{
    success: boolean;
    data: HealthAnalysis;
  }>(`/analysis/${id}`);

  return response.data.data;
};

export const submitAnalysisFeedback = async (
  id: string,
  helpful: boolean
): Promise<void> => {
  await api.patch(`/analysis/${id}/feedback`, { helpful });
};

export const getLatestHealthAnalysis = async (): Promise<{
  analysis: HealthAnalysis | null;
}> => {
  const response = await api.get<{
    success: boolean;
    data: { analysis: HealthAnalysis | null };
  }>("/analysis/latest");

  return response.data.data;
};

export const getAnalysisHistory = async (): Promise<HealthAnalysis[]> => {
  const response = await api.get<{
    success: boolean;
    data: HealthAnalysis[];
  }>("/analysis");

  return response.data.data;
};

export interface QuickCheckResult {
  recognized: boolean;
  needsFullAnalysis: boolean;
  summary: string;
  considerations: string[];
  generalGuidance: string[];
  whenToSeekCare: string[];
  urgencyLevel: UrgencyLevel;
  disclaimer: string;
}

export const runQuickSymptomCheck = async (
  symptom: string
): Promise<QuickCheckResult> => {
  const response = await api.post<{
    success: boolean;
    data: QuickCheckResult;
  }>("/analysis/quick-check", { symptom });

  return response.data.data;
};
