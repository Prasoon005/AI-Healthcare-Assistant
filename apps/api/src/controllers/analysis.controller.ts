import { Request, Response } from "express";

import {
  createAnalysis,
  getAnalysis,
  getAnalysisHistory,
  getLatestAnalysis,
  runQuickCheck,
  submitAnalysisFeedback,
} from "../services/analysis.service";

import { AIUnavailableError } from "../services/ai.service";

import {
  analysisFeedbackSchema,
  createAnalysisSchema,
  quickCheckSchema,
} from "../validations/analysis.validation";

import {
  successResponse,
  errorResponse,
} from "../utils/response";

export const createAnalysisController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = createAnalysisSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Invalid analysis data"
      );
    }

    const photo = req.file
      ? {
          mimeType: req.file.mimetype,
          base64Data: req.file.buffer.toString("base64"),
        }
      : undefined;

    const analysis = await createAnalysis(
      req.user!.id,
      parsed.data,
      photo
    );

    return successResponse(
      res,
      201,
      "Health analysis generated successfully",
      analysis
    );
  } catch (error) {
    if (error instanceof AIUnavailableError) {
      return errorResponse(
        res,
        503,
        "The AI service is temporarily unavailable. Please try again in a moment."
      );
    }

    console.error(
      "CREATE ANALYSIS ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(
      res,
      500,
      "Failed to generate health analysis"
    );
  }
};

export const getAnalysisController = async (
  req: Request,
  res: Response
) => {
  try {
    const analysis = await getAnalysis(
      req.user!.id,
      req.params.id as string
    );

    return successResponse(
      res,
      200,
      "Health analysis fetched successfully",
      analysis
    );
  } catch (error) {
    return errorResponse(res, 404, "Analysis not found");
  }
};

export const submitAnalysisFeedbackController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = analysisFeedbackSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Invalid feedback"
      );
    }

    await submitAnalysisFeedback(
      req.user!.id,
      req.params.id as string,
      parsed.data.helpful
    );

    return successResponse(res, 200, "Feedback recorded successfully");
  } catch (error) {
    return errorResponse(res, 404, "Analysis not found");
  }
};

export const getLatestAnalysisController = async (
  req: Request,
  res: Response
) => {
  try {
    const analysis = await getLatestAnalysis(req.user!.id);

    return successResponse(
      res,
      200,
      "Latest health analysis fetched successfully",
      { analysis }
    );
  } catch (error) {
    console.error(
      "GET LATEST ANALYSIS ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(
      res,
      500,
      "Failed to fetch latest health analysis"
    );
  }
};

export const getAnalysisHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const analyses = await getAnalysisHistory(req.user!.id);

    return successResponse(
      res,
      200,
      "Health analysis history fetched successfully",
      analyses
    );
  } catch (error) {
    console.error(
      "GET ANALYSIS HISTORY ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(
      res,
      500,
      "Failed to fetch health analysis history"
    );
  }
};

export const quickCheckController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = quickCheckSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Please enter a symptom"
      );
    }

    const result = await runQuickCheck(
      req.user!.id,
      parsed.data.symptom
    );

    return successResponse(
      res,
      200,
      "Quick check completed",
      result
    );
  } catch (error) {
    if (error instanceof AIUnavailableError) {
      return errorResponse(
        res,
        503,
        "Quick check is temporarily unavailable. Please try again in a moment."
      );
    }

    console.error(
      "QUICK CHECK ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to run quick check");
  }
};
