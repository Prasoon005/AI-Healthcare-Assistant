import { prisma } from "../config/prisma";

interface CreateVitalData {
  heartRate?: number;
  systolic?: number;
  diastolic?: number;
  spo2?: number;
}

export const createVitalLog = async (
  userId: string,
  data: CreateVitalData
) => {
  return prisma.vitalLog.create({
    data: {
      userId,
      heartRate: data.heartRate,
      systolic: data.systolic,
      diastolic: data.diastolic,
      spo2: data.spo2,
    },
  });
};

export const getUserVitalLogs = async (
  userId: string
) => {
  return prisma.vitalLog.findMany({
    where: {
      userId,
    },
    orderBy: {
      recordedAt: "desc",
    },
    take: 50,
  });
};

export const deleteVitalLog = async (
  userId: string,
  vitalId: string
) => {
  const vital = await prisma.vitalLog.findFirst({
    where: {
      id: vitalId,
      userId,
    },
  });

  if (!vital) {
    return null;
  }

  return prisma.vitalLog.delete({
    where: {
      id: vitalId,
    },
  });
};