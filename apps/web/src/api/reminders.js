import api from "./axios";
export const getReminders = async () => {
    const response = await api.get("/reminders");
    return response.data.data;
};
export const createReminder = async (input) => {
    const response = await api.post("/reminders", input);
    return response.data.data;
};
export const deleteReminder = async (id) => {
    await api.delete(`/reminders/${id}`);
};
