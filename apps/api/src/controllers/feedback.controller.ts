import { Request, Response } from "express";

import { submitFeedback } from "../services/feedback.service";
import { createFeedbackSchema } from "../validations/feedback.validation";
import { successResponse, errorResponse } from "../utils/response";

export const submitFeedbackController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = createFeedbackSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Invalid feedback"
      );
    }

    const feedback = await submitFeedback(req.user!.id, parsed.data);

    return successResponse(
      res,
      201,
      "Thanks for your feedback",
      feedback
    );
  } catch (error) {
    console.error(
      "SUBMIT FEEDBACK ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to submit feedback");
  }
};
