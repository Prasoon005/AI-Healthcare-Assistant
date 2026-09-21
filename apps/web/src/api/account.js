import api from "./axios";
export const getAccount = async () => {
    const response = await api.get("/account");
    return response.data.data;
};
export const updateAccount = async (input) => {
    const response = await api.patch("/account", input);
    return response.data.data;
};
export const changePassword = async (input) => {
    await api.patch("/account/password", input);
};
export const logoutAllDevices = async () => {
    await api.post("/account/logout-all");
};
export const exportAccountData = async () => {
    const response = await api.get("/account/export");
    return response.data.data;
};
export const deleteAccount = async (password) => {
    await api.delete("/account", { data: { password } });
};
