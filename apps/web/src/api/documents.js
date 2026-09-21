import api from "./axios";
export const getDocuments = async () => {
    const response = await api.get("/documents");
    return response.data.data;
};
export const getDocument = async (documentId) => {
    const response = await api.get(`/documents/${documentId}`);
    return response.data.data;
};
export const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append("document", file);
    const response = await api.post("/documents/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};
export const deleteDocument = async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
};
