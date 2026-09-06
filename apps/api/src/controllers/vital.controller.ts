import { Request, Response } from "express";

import {
  addVitalLog,
  getVitals,
  removeVitalLog,
} from "../services/vital.service";

import {
  createVitalSchema,
} from "../validations/vital.validation";

import {
  successResponse,
  errorResponse,
} from "../utils/response";

export const createVitalController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = createVitalSchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message ||
          "Invalid vital data"
      );
    }

    const vital = await addVitalLog(
      req.user!.id,
      parsed.data
    );

    return successResponse(
      res,
      201,
      "Vital log added successfully",
      vital
    );
  } catch (error) {
    console.error(
      "CREATE VITAL ERROR:",
      error
    );

    return errorResponse(
      res,
      500,
      "Failed to add vital log"
    );
  }
};

export const getVitalsController = async (
  req: Request,
  res: Response
) => {
  try {
    const vitals = await getVitals(
      req.user!.id
    );

    return successResponse(
      res,
      200,
      "Vital logs fetched successfully",
      vitals
    );
  } catch (error) {
    console.error(
      "GET VITALS ERROR:",
      error
    );

    return errorResponse(
      res,
      500,
      "Failed to fetch vital logs"
    );
  }
};

export const deleteVitalController = async (
  req: Request,
  res: Response
) => {
  try {
    const vitalId = req.params.id as string;

    await removeVitalLog(
      req.user!.id,
      vitalId
    );

    return successResponse(
      res,
      200,
      "Vital log deleted successfully"
    );
  } catch (error) {
    console.error(
      "DELETE VITAL ERROR:",
      error
    );

    return errorResponse(
      res,
      404,
      "Vital log not found"
    );
  }
};