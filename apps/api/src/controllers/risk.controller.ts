import { Request, Response } from "express";

import { calculateRiskMatrix } from "../services/risk.service";

import {
  successResponse,
  errorResponse,
} from "../utils/response";

export const getRiskMatrixController = async (
  req: Request,
  res: Response
) => {
  try {
    const result =
      await calculateRiskMatrix(
        req.user!.id
      );

    return successResponse(
      res,
      200,
      "Preventive wellness assessment fetched successfully",
      result
    );
  } catch (error) {
    console.error(
      "RISK MATRIX ERROR:",
      error
    );

    return errorResponse(
      res,
      500,
      "Failed to calculate wellness assessment"
    );
  }
};