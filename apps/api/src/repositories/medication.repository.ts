import { prisma } from "../config/prisma";

export const getUserMedications = (userId: string) => {
  return prisma.medication.findMany({
    where: {
      userId,
      active: true,
    },
    include: {
      logs: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createMedication = (
  userId: string,
  data: {
    name: string;
    dosage: string;
    instructions?: string;
    times: string[];
  }
) => {
  return prisma.medication.create({
    data: {
      userId,
      name: data.name,
      dosage: data.dosage,
      instructions: data.instructions,
      times: data.times,
    },
  });
};

export const findMedication = (
  medicationId: string,
  userId: string
) => {
  return prisma.medication.findFirst({
    where: {
      id: medicationId,
      userId,
      active: true,
    },
  });
};

export const findMedicationLog = (
  medicationId: string,
  date: Date,
  scheduledTime: string
) => {
  return prisma.medicationLog.findUnique({
    where: {
      medicationId_scheduledDate_scheduledTime: {
        medicationId,
        scheduledDate: date,
        scheduledTime,
      },
    },
  });
};

export const createMedicationLog = (
  medicationId: string,
  date: Date,
  scheduledTime: string
) => {
  return prisma.medicationLog.create({
    data: {
      medicationId,
      scheduledDate: date,
      scheduledTime,
    },
  });
};

export const markMedicationTaken = (id: string) => {
  return prisma.medicationLog.update({
    where: { id },
    data: {
      taken: true,
      takenAt: new Date(),
    },
  });
};

export const deleteMedication = async (
  medicationId: string,
  userId: string
) => {
  const medication = await prisma.medication.findFirst({
    where: {
      id: medicationId,
      userId,
    },
  });

  if (!medication) {
    return null;
  }

  await prisma.medicationLog.deleteMany({
    where: {
      medicationId,
    },
  });

  return prisma.medication.delete({
    where: {
      id: medicationId,
    },
  });
};