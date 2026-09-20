import api from "./axios";
export const getRiskMatrix = async () => {
    const response = await api.get("/risk-matrix");
    return response.data.data;
};
