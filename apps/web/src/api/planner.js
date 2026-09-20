import api from "./axios";
export const getDailyPlan = async () => {
    const response = await api.get("/planner");
    return response.data.data;
};
