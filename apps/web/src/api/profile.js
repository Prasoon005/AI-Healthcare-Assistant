import api from "./axios";
export const getHealthProfile = async () => {
    const response = await api.get("/profile");
    return response.data.data;
};
export const saveHealthProfile = async (data) => {
    const response = await api.put("/profile", data);
    return response.data.data;
};
