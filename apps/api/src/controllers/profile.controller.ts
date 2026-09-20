import { Request, Response } from "express";

import {
  getProfile,
  saveProfile,
} from "../services/profile.service";

import { updateProfileSchema } from "../validations/profile.validation";

import {
  successResponse,
  errorResponse,
} from "../utils/response";

export const getProfileController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await getProfile(req.user!.id);

    return successResponse(
      res,
      200,
      "Health profile fetched successfully",
      result
    );
  } catch (error) {
    console.error(
      "GET PROFILE ERROR:",
      error
    );

    return errorResponse(
      res,
      500,
      "Failed to fetch health profile"
    );
  }
};

export const updateProfileController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = updateProfileSchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message ||
          "Invalid profile data"
      );
    }

    const result = await saveProfile(
      req.user!.id,
      parsed.data
    );

    return successResponse(
      res,
      200,
      "Health profile saved successfully",
      result
    );
  } catch (error) {
    console.error(
      "UPDATE PROFILE ERROR:",
      error
    );

    return errorResponse(
      res,
      500,
      "Failed to save health profile"
    );
  }
};
