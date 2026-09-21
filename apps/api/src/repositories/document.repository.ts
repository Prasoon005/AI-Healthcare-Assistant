import { prisma } from "../config/prisma";

export const createDocument = async (
  userId: string,
  data: {
    name: string;
    originalName: string;
    filePath: string;
    mimeType: string;
    fileSize: number;
    extractedText?: string;
  }
) => {
  return prisma.medicalDocument.create({
    data: {
      userId,
      ...data,
    },
  });
};

export const getUserDocuments = async (
  userId: string
) => {
  return prisma.medicalDocument.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findDocumentsByUserInRange = async (
  userId: string,
  start: Date | null,
  end: Date,
  take?: number
) => {
  return prisma.medicalDocument.findMany({
    where: {
      userId,
      createdAt: start ? { gte: start, lte: end } : { lte: end },
    },
    orderBy: { createdAt: "desc" },
    ...(take ? { take } : {}),
  });
};

export const findDocumentsByIds = async (
  userId: string,
  ids: string[]
) => {
  if (ids.length === 0) return [];

  return prisma.medicalDocument.findMany({
    where: {
      userId,
      id: { in: ids },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findDocument = async (
  documentId: string,
  userId: string
) => {
  return prisma.medicalDocument.findFirst({
    where: {
      id: documentId,
      userId,
    },
  });
};

export const deleteDocument = async (
  documentId: string,
  userId: string
) => {
  return prisma.medicalDocument.deleteMany({
    where: {
      id: documentId,
      userId,
    },
  });
};