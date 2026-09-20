import api from "./axios";
export const registerUser = async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data;
};
