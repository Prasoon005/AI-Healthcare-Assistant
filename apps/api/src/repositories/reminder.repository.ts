import { prisma } from "../config/prisma";

export const createReminder = async (
  userId: string,
  data: {
    title: string;
    note: string | null;
    dueDate: Date;
    analysisId?: string;
  }
) => {
  return prisma.reminder.create({
    data: {
      userId,
      ...data,
    },
  });
};

export const getUserReminders = async (userId: string) => {
  return prisma.reminder.findMany({
    where: { userId },
    orderBy: { dueDate: "asc" },
  });
};

export const findReminder = async (id: string, userId: string) => {
  return prisma.reminder.findFirst({
    where: { id, userId },
  });
};

export const deleteReminder = async (id: string, userId: string) => {
  return prisma.reminder.deleteMany({
    where: { id, userId },
  });
};
