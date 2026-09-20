import api from "./axios";

export interface Reminder {
  id: string;
  title: string;
  note: string | null;
  dueDate: string;
  analysisId: string | null;
  createdAt: string;
}

export interface CreateReminderInput {
  title: string;
  note?: string;
  dueDate: string;
}

export const getReminders = async (): Promise<Reminder[]> => {
  const response = await api.get<{
    success: boolean;
    data: Reminder[];
  }>("/reminders");

  return response.data.data;
};

export const createReminder = async (
  input: CreateReminderInput
): Promise<Reminder> => {
  const response = await api.post<{
    success: boolean;
    data: Reminder;
  }>("/reminders", input);

  return response.data.data;
};

export const deleteReminder = async (id: string): Promise<void> => {
  await api.delete(`/reminders/${id}`);
};
