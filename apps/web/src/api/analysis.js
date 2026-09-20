import api from "./axios";
export const createHealthAnalysis = async (input) => {
    const formData = new FormData();
    formData.append("concern", input.concern);
    formData.append("duration", input.duration);
    formData.append("severity", input.severity);
    if (input.additionalContext) {
        formData.append("additionalContext", input.additionalContext);
    }
    if (input.photo) {
        formData.append("photo", input.photo);
    }
    const response = await api.post("/analysis", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
};
export const getHealthAnalysis = async (id) => {
    const response = await api.get(`/analysis/${id}`);
    return response.data.data;
};
export const submitAnalysisFeedback = async (id, helpful) => {
    await api.patch(`/analysis/${id}/feedback`, { helpful });
};
export const getLatestHealthAnalysis = async () => {
    const response = await api.get("/analysis/latest");
    return response.data.data;
};
export const getAnalysisHistory = async () => {
    const response = await api.get("/analysis");
    return response.data.data;
};
export const runQuickSymptomCheck = async (symptom) => {
    const response = await api.post("/analysis/quick-check", { symptom });
    return response.data.data;
};
