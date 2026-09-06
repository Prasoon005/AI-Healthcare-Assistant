import api from "./axios";

export interface MedicationDose {
  id: string;
  scheduledTime: string;
  taken: boolean;
  takenAt: string | null;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions?: string | null;
  doses: MedicationDose[];
}

export interface CreateMedicationData {
  name: string;
  dosage: string;
  instructions?: string;
  times: string[];
}

/* ================= GET TODAY ================= */

export const getTodayMedications = async () => {
  const response = await api.get<{
    success: boolean;
    data: Medication[];
  }>("/medications/today");

  return response.data.data;
};

/* ================= CREATE ================= */

export const createMedication = async (
  data: CreateMedicationData
) => {
  const response = await api.post(
    "/medications",
    data
  );

  return response.data;
};

/* ================= DELETE ================= */

export const deleteMedication = async (
  medicationId: string
) => {
  const response = await api.delete(
    `/medications/${medicationId}`
  );

  return response.data;
};

/* ================= TAKE ================= */

export const takeMedication = async (
  medicationId: string,
  logId: string,
  scheduledTime: string
) => {
  const response = await api.patch(
    `/medications/${medicationId}/doses/${logId}/take`,
    {
      scheduledTime,
    }
  );

  return response.data;
};