import { Request, Response } from "express";
import { registerSchema } from "../validations/auth.validation";
import { registerUser } from "../services/auth.service";
import { successResponse, errorResponse } from "../utils/response";

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const user = await registerUser(data);

    return successResponse(
      res,
      201,
      "User registered successfully",
      user
    );
  } catch (error) {
    return errorResponse(
      res,
      400,
      error instanceof Error ? error.message : "Registration failed"
    );
  }
};