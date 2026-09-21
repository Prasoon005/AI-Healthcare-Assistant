import { Request, Response } from "express";

import {
  askReportQuestion,
  generateReport,
  getFollowUpQuestions,
  getLatestReport,
  getReport,
  getReports,
} from "../services/report.service";

import { AIUnavailableError } from "../services/ai.service";

import {
  generateReportSchema,
  reportQuestionSchema,
} from "../validations/report.validation";

import { successResponse, errorResponse } from "../utils/response";

export const getFollowUpQuestionsController = async (
  req: Request,
  res: Response
) => {
  try {
    const questions = await getFollowUpQuestions(req.user!.id);

    return successResponse(
      res,
      200,
      "Follow-up questions fetched successfully",
      questions
    );
  } catch (error) {
    console.error(
      "GET FOLLOW-UP QUESTIONS ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to fetch follow-up questions");
  }
};

export const generateReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = generateReportSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Invalid report request"
      );
    }

    const report = await generateReport(req.user!.id, parsed.data);

    return successResponse(
      res,
      201,
      "Health report generated successfully",
      report
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
      "GENERATE REPORT ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to generate health report");
  }
};

export const getReportsController = async (req: Request, res: Response) => {
  try {
    const reports = await getReports(req.user!.id);

    return successResponse(
      res,
      200,
      "Health reports fetched successfully",
      reports
    );
  } catch (error) {
    console.error(
      "GET REPORTS ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to fetch health reports");
  }
};

export const getLatestReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const report = await getLatestReport(req.user!.id);

    return successResponse(
      res,
      200,
      "Latest health report fetched successfully",
      { report }
    );
  } catch (error) {
    console.error(
      "GET LATEST REPORT ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to fetch latest health report");
  }
};

export const getReportController = async (req: Request, res: Response) => {
  try {
    const report = await getReport(req.user!.id, req.params.id as string);

    return successResponse(
      res,
      200,
      "Health report fetched successfully",
      report
    );
  } catch (error) {
    return errorResponse(res, 404, "Report not found");
  }
};

export const askReportQuestionController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = reportQuestionSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Please enter a question"
      );
    }

    const result = await askReportQuestion(
      req.user!.id,
      req.params.id as string,
      parsed.data.question
    );

    return successResponse(res, 201, "Question answered successfully", result);
  } catch (error) {
    if (error instanceof AIUnavailableError) {
      return errorResponse(
        res,
        503,
        "HealthAI is temporarily unavailable. Please try again in a moment."
      );
    }

    if (error instanceof Error && error.message === "Report not found") {
      return errorResponse(res, 404, "Report not found");
    }

    console.error(
      "ASK REPORT QUESTION ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to answer your question");
  }
};
