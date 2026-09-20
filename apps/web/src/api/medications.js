import api from "./axios";
/* ================= GET TODAY ================= */
export const getTodayMedications = async () => {
    const response = await api.get("/medications/today");
    return response.data.data;
};
/* ================= CREATE ================= */
export const createMedication = async (data) => {
    const response = await api.post("/medications", data);
    return response.data;
};
/* ================= DELETE ================= */
export const deleteMedication = async (medicationId) => {
    const response = await api.delete(`/medications/${medicationId}`);
    return response.data;
};
/* ================= TAKE ================= */
export const takeMedication = async (medicationId, logId, scheduledTime) => {
    const response = await api.patch(`/medications/${medicationId}/doses/${logId}/take`, {
        scheduledTime,
    });
    return response.data;
};
