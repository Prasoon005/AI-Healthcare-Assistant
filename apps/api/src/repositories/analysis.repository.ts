import { prisma } from "../config/prisma";
import type { Prisma } from "@prisma/client";

export const createHealthAnalysis = async (
  userId: string,
  data: {
    concern: string;
    duration: string;
    severity: string;
    additionalContext: string | null;
    profileSnapshot: Prisma.InputJsonValue | undefined;
    aiResult: Prisma.InputJsonValue;
    urgencyLevel: string;
    hasPhoto: boolean;
  }
) => {
  return prisma.healthAnalysis.create({
    data: {
      userId,
      ...data,
    },
  });
};

export const findAnalysisById = async (
  id: string,
  userId: string
) => {
  return prisma.healthAnalysis.findFirst({
    where: {
      id,
      userId,
    },
  });
};

export const findLatestAnalysisByUser = async (
  userId: string
) => {
  return prisma.healthAnalysis.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const findRecentAnalysesByUser = async (
  userId: string,
  limit: number
) => {
  return prisma.healthAnalysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

export const findAnalysesByUserInRange = async (
  userId: string,
  start: Date | null,
  end: Date
) => {
  return prisma.healthAnalysis.findMany({
    where: {
      userId,
      createdAt: start ? { gte: start, lte: end } : { lte: end },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateAnalysisFeedback = async (
  id: string,
  userId: string,
  helpful: boolean
) => {
  return prisma.healthAnalysis.updateMany({
    where: { id, userId },
    data: { helpful },
  });
};
