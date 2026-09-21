import { Request, Response } from "express";

import { getAnalytics, getHistory, getRecentEvents } from "../services/history.service";

import {
  historyAnalyticsQuerySchema,
  historyQuerySchema,
  historyRecentQuerySchema,
} from "../validations/history.validation";

import { successResponse, errorResponse } from "../utils/response";

export const getHistoryController = async (req: Request, res: Response) => {
  try {
    const parsed = historyQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Invalid history query"
      );
    }

    const result = await getHistory(req.user!.id, parsed.data);

    return successResponse(
      res,
      200,
      "Health history fetched successfully",
      result
    );
  } catch (error) {
    console.error(
      "GET HISTORY ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to fetch health history");
  }
};

export const getRecentEventsController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = historyRecentQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Invalid request"
      );
    }

    const events = await getRecentEvents(req.user!.id, parsed.data.limit);

    return successResponse(
      res,
      200,
      "Recent activity fetched successfully",
      events
    );
  } catch (error) {
    console.error(
      "GET RECENT EVENTS ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to fetch recent activity");
  }
};

export const getAnalyticsController = async (req: Request, res: Response) => {
  try {
    const parsed = historyAnalyticsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Invalid analytics query"
      );
    }

    const result = await getAnalytics(req.user!.id, parsed.data.range);

    return successResponse(
      res,
      200,
      "Health analytics fetched successfully",
      result
    );
  } catch (error) {
    console.error(
      "GET ANALYTICS ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to fetch health analytics");
  }
};
