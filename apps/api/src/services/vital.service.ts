import {
  createVitalLog,
  getUserVitalLogs,
  deleteVitalLog,
} from "../repositories/vital.repository";

import type { CreateVitalInput } from "../validations/vital.validation";

export const addVitalLog = async (
  userId: string,
  data: CreateVitalInput
) => {
  return createVitalLog(userId, data);
};

export const getVitals = async (
  userId: string
) => {
  return getUserVitalLogs(userId);
};

export const removeVitalLog = async (
  userId: string,
  vitalId: string
) => {
  const vital = await deleteVitalLog(
    userId,
    vitalId
  );

  if (!vital) {
    throw new Error("Vital log not found");
  }

  return vital;
};