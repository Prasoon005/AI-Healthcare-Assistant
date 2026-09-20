import api from "./axios";

export type RiskLevel =
  | "low"
  | "moderate"
  | "high";

export interface RiskItem {
  key: string;
  label: string;
  score: number;
  level: RiskLevel;
  description: string;
}

export interface RiskMatrixResponse {
  available: boolean;
  completeness: number;
  items: RiskItem[];
  overallWellnessScore: number | null;
  disclaimer?: string;
}

export const getRiskMatrix =
  async (): Promise<RiskMatrixResponse> => {
    const response = await api.get<{
      success: boolean;
      data: RiskMatrixResponse;
    }>("/risk-matrix");

    return response.data.data;
  };