import { Request, Response } from "express";

import {
  getDocumentById,
  getDocuments,
  removeDocument,
  uploadMedicalDocument,
} from "../services/document.service";

import {
  successResponse,
  errorResponse,
} from "../utils/response";

export const uploadDocumentController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      if (!req.file) {
        return errorResponse(
          res,
          400,
          "Please upload a medical document"
        );
      }

      const document =
        await uploadMedicalDocument(
          req.user!.id,
          req.file
        );

      return successResponse(
        res,
        201,
        "Medical document uploaded successfully",
        document
      );
    } catch (error) {
      console.error(
        "UPLOAD DOCUMENT ERROR:",
        error
      );

      return errorResponse(
        res,
        400,
        error instanceof Error
          ? error.message
          : "Failed to upload document"
      );
    }
  };

export const getDocumentsController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const documents =
        await getDocuments(
          req.user!.id
        );

      return successResponse(
        res,
        200,
        "Medical documents fetched successfully",
        documents
      );
    } catch (error) {
      console.error(
        "GET DOCUMENTS ERROR:",
        error
      );

      return errorResponse(
        res,
        500,
        "Failed to fetch documents"
      );
    }
  };

export const getDocumentController = async (
  req: Request,
  res: Response
) => {
  try {
    const document = await getDocumentById(
      req.user!.id,
      req.params.documentId as string
    );

    return successResponse(
      res,
      200,
      "Medical document fetched successfully",
      document
    );
  } catch (error) {
    return errorResponse(res, 404, "Document not found");
  }
};

export const deleteDocumentController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      await removeDocument(
        req.user!.id,
        req.params.documentId as string
      );

      return successResponse(
        res,
        200,
        "Medical document deleted successfully"
      );
    } catch (error) {
      console.error(
        "DELETE DOCUMENT ERROR:",
        error
      );

      return errorResponse(
        res,
        404,
        "Document not found"
      );
    }
  };