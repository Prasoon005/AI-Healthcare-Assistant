import { Request, Response } from "express";

import { getDailyPlan } from "../services/planner.service";

import {
  successResponse,
  errorResponse,
} from "../utils/response";

export const getDailyPlanController = async (
  req: Request,
  res: Response
) => {
  try {
    const plan = await getDailyPlan(req.user!.id);

    return successResponse(
      res,
      200,
      "Daily health plan generated successfully",
      plan
    );
  } catch (error) {
    console.error("DAILY PLAN ERROR:", error);

    return errorResponse(
      res,
      500,
      "Failed to generate daily health plan"
    );
  }
};