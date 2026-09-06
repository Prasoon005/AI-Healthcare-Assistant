import {
  createMedication,
  createMedicationLog,
  findMedication,
  findMedicationLog,
  getUserMedications,
  markMedicationTaken,
  deleteMedication as deleteMedicationRepository,
} from "../repositories/medication.repository";

import type { CreateMedicationInput } from "../validations/medication.validation";

const startOfToday = () => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
};

const getTodayDose = async (
  medicationId: string,
  scheduledTime: string
) => {
  const date = startOfToday();

  let log = await findMedicationLog(
    medicationId,
    date,
    scheduledTime
  );

  if (!log) {
    log = await createMedicationLog(
      medicationId,
      date,
      scheduledTime
    );
  }

  return log;
};

export const addMedication = async (
  userId: string,
  data: CreateMedicationInput
) => {
  return createMedication(userId, {
    name: data.name,
    dosage: data.dosage,
    instructions: data.instructions,
    times: [...new Set(data.times)].sort(),
  });
};

export const getTodayMedications = async (userId: string) => {
  const medications = await getUserMedications(userId);

  const result = [];

  for (const medication of medications) {
    const doses = [];

    for (const time of medication.times) {
      const log = await getTodayDose(
        medication.id,
        time
      );

      doses.push({
        id: log.id,
        scheduledTime: time,
        taken: log.taken,
        takenAt: log.takenAt,
      });
    }

    result.push({
      id: medication.id,
      name: medication.name,
      dosage: medication.dosage,
      instructions: medication.instructions,
      doses,
    });
  }

  return result;
};

export const takeMedication = async (
  userId: string,
  medicationId: string,
  logId: string
) => {
  const medication = await findMedication(
    medicationId,
    userId
  );

  if (!medication) {
    throw new Error("Medication not found");
  }

  return markMedicationTaken(logId);
};

export const removeMedication = async (
  userId: string,
  medicationId: string
) => {
  const medication =
    await deleteMedicationRepository(
      medicationId,
      userId
    );

  if (!medication) {
    throw new Error("Medication not found");
  }

  return medication;
};