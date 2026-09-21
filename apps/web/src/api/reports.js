import api from "./axios";
export const REPORT_RANGE_OPTIONS = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "all", label: "All time" },
];
export const getFollowUpQuestions = async () => {
    const response = await api.get("/reports/follow-up-questions");
    return response.data.data;
};
export const generateHealthReport = async (input) => {
    const response = await api.post("/reports", input);
    return response.data.data;
};
export const getHealthReports = async () => {
    const response = await api.get("/reports");
    return response.data.data;
};
export const getLatestHealthReport = async () => {
    const response = await api.get("/reports/latest");
    return response.data.data;
};
export const getHealthReport = async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data.data;
};
export const askAboutReport = async (id, question) => {
    const response = await api.post(`/reports/${id}/questions`, { question });
    return response.data.data;
};
