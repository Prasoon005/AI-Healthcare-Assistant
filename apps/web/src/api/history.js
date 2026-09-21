import api from "./axios";
export const HISTORY_RANGE_OPTIONS = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "all", label: "All time" },
];
export const HISTORY_TYPE_OPTIONS = [
    { value: "all", label: "All" },
    { value: "report", label: "Reports" },
    { value: "analysis", label: "Analyses" },
    { value: "vital", label: "Vitals" },
    { value: "medication", label: "Medications" },
    { value: "document", label: "Documents" },
    { value: "profile", label: "Profile" },
    { value: "followup", label: "Follow-ups" },
];
export const getHistory = async (params = {}) => {
    const response = await api.get("/history", { params });
    return response.data.data;
};
export const getRecentActivity = async (limit = 5) => {
    const response = await api.get("/history/recent", { params: { limit } });
    return response.data.data;
};
export const getAnalytics = async (range) => {
    const response = await api.get("/history/analytics", { params: { range } });
    return response.data.data;
};
