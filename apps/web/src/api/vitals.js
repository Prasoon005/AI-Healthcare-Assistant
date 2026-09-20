import api from "./axios";
export const getVitals = async () => {
    const response = await api.get("/vitals");
    return response.data.data;
};
export const createVital = async (data) => {
    const response = await api.post("/vitals", data);
    return response.data.data;
};
export const deleteVital = async (vitalId) => {
    const response = await api.delete(`/vitals/${vitalId}`);
    return response.data;
};
