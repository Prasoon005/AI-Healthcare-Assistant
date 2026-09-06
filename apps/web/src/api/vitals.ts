import api from "./axios";

export interface VitalLog {
  id: string;
  heartRate: number | null;
  systolic: number | null;
  diastolic: number | null;
  spo2: number | null;
  recordedAt: string;
  createdAt: string;
}

export interface CreateVitalData {
  heartRate?: number;
  systolic?: number;
  diastolic?: number;
  spo2?: number;
}

export const getVitals = async (): Promise<VitalLog[]> => {
  const response = await api.get<{
    success: boolean;
    data: VitalLog[];
  }>("/vitals");

  return response.data.data;
};

export const createVital = async (
  data: CreateVitalData
) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: VitalLog;
  }>("/vitals", data);

  return response.data.data;
};

export const deleteVital = async (
  vitalId: string
) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/vitals/${vitalId}`);

  return response.data;
};