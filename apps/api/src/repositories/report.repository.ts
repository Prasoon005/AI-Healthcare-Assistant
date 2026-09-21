import { prisma } from "../config/prisma";
import type { Prisma } from "@prisma/client";

interface CreateReportData {
  rangeKey: string;
  periodStart: Date | null;
  periodEnd: Date;
  profileSnapshot: Prisma.InputJsonValue | undefined;
  vitalsSummary: Prisma.InputJsonValue;
  wellnessSnapshot: Prisma.InputJsonValue;
  analysesSummary: Prisma.InputJsonValue;
  medicationsSummary: Prisma.InputJsonValue;
  documentsSummary: Prisma.InputJsonValue;
  followUpAnswers: Prisma.InputJsonValue;
  reportContent: Prisma.InputJsonValue;
}

export const createHealthReport = async (
  userId: string,
  data: CreateReportData
) => {
  return prisma.healthReport.create({
    data: {
      userId,
      ...data,
    },
  });
};

const LIST_SELECT = {
  id: true,
  rangeKey: true,
  periodStart: true,
  periodEnd: true,
  createdAt: true,
} as const;

export const findReportsByUser = async (userId: string) => {
  return prisma.healthReport.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: LIST_SELECT,
  });
};

export const findAllReportsFullByUser = async (userId: string) => {
  return prisma.healthReport.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      questions: { orderBy: { createdAt: "asc" } },
    },
  });
};

export const findLatestReportSummaryByUser = async (userId: string) => {
  return prisma.healthReport.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: LIST_SELECT,
  });
};

const HISTORY_SELECT = {
  id: true,
  rangeKey: true,
  periodStart: true,
  periodEnd: true,
  followUpAnswers: true,
  createdAt: true,
} as const;

export const findReportsForHistory = async (
  userId: string,
  start: Date | null,
  end: Date,
  take?: number
) => {
  return prisma.healthReport.findMany({
    where: {
      userId,
      createdAt: start ? { gte: start, lte: end } : { lte: end },
    },
    orderBy: { createdAt: "desc" },
    select: HISTORY_SELECT,
    ...(take ? { take } : {}),
  });
};

export const findLatestReportByUser = async (userId: string) => {
  return prisma.healthReport.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const findReportById = async (id: string, userId: string) => {
  return prisma.healthReport.findFirst({
    where: { id, userId },
    include: {
      questions: { orderBy: { createdAt: "asc" } },
    },
  });
};

export const findReportOwnedByUser = async (id: string, userId: string) => {
  return prisma.healthReport.findFirst({
    where: { id, userId },
  });
};

export const createReportQuestion = async (
  reportId: string,
  data: { question: string; answer: string }
) => {
  return prisma.reportQuestion.create({
    data: {
      reportId,
      ...data,
    },
  });
};
