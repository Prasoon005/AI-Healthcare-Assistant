import fs from "fs/promises";
import path from "path";
import Tesseract from "tesseract.js";

import {
  createDocument,
  deleteDocument,
  findDocument,
  getUserDocuments,
} from "../repositories/document.repository";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
];

export const uploadMedicalDocument = async (
  userId: string,
  file: Express.Multer.File
) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(
      "Only JPG, JPEG and PNG files are supported."
    );
  }

  let extractedText = "";

  try {
    const result =
      await Tesseract.recognize(
        file.path,
        "eng"
      );

    extractedText =
      result.data.text.trim();
  } catch (error) {
    console.error(
      "OCR ERROR:",
      error
    );
  }

  return createDocument(
    userId,
    {
      name: path.parse(
        file.originalname
      ).name,
      originalName:
        file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
      extractedText,
    }
  );
};

export const getDocuments = async (
  userId: string
) => {
  return getUserDocuments(userId);
};

export const getDocumentById = async (
  userId: string,
  documentId: string
) => {
  const document = await findDocument(documentId, userId);

  if (!document) {
    throw new Error("Document not found");
  }

  return document;
};

export const removeDocument = async (
  userId: string,
  documentId: string
) => {
  const document =
    await findDocument(
      documentId,
      userId
    );

  if (!document) {
    throw new Error(
      "Document not found"
    );
  }

  try {
    await fs.unlink(
      document.filePath
    );
  } catch {
    // File may already be missing.
  }

  await deleteDocument(
    documentId,
    userId
  );

  return true;
};