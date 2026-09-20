import {
  createReminder,
  deleteReminder,
  findReminder,
  getUserReminders,
} from "../repositories/reminder.repository";

import type { CreateReminderInput } from "../validations/reminder.validation";

export const addReminder = async (
  userId: string,
  data: CreateReminderInput
) => {
  return createReminder(userId, {
    title: data.title,
    note: data.note ?? null,
    dueDate: new Date(data.dueDate),
  });
};

export const listReminders = async (userId: string) => {
  return getUserReminders(userId);
};

export const removeReminder = async (userId: string, id: string) => {
  const reminder = await findReminder(id, userId);

  if (!reminder) {
    throw new Error("Reminder not found");
  }

  await deleteReminder(id, userId);
};
