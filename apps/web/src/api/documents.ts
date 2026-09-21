import api from "./axios";

export interface MedicalDocument {
  id: string;
  name: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  extractedText: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getDocuments =
  async (): Promise<
    MedicalDocument[]
  > => {
    const response =
      await api.get<{
        success: boolean;
        data: MedicalDocument[];
      }>("/documents");

    return response.data.data;
  };

export const getDocument =
  async (
    documentId: string
  ): Promise<MedicalDocument> => {
    const response =
      await api.get<{
        success: boolean;
        data: MedicalDocument;
      }>(`/documents/${documentId}`);

    return response.data.data;
  };

export const uploadDocument =
  async (
    file: File
  ) => {
    const formData =
      new FormData();

    formData.append(
      "document",
      file
    );

    const response =
      await api.post(
        "/documents/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  };

export const deleteDocument =
  async (
    documentId: string
  ) => {
    const response =
      await api.delete(
        `/documents/${documentId}`
      );

    return response.data;
  };