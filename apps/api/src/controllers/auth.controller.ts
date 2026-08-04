import { Request, Response } from "express";
import {
  registerSchema,
  loginSchema,
} from "../validations/auth.validation";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserToken,
} from "../services/auth.service";
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
      error instanceof Error
        ? error.message
        : "Registration failed"
    );
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await loginUser(
      data.email,
      data.password
    );

    return successResponse(
      res,
      200,
      "Login successful",
      result
    );
  } catch (error) {
    return errorResponse(
      res,
      401,
      error instanceof Error
        ? error.message
        : "Login failed"
    );
  }
};

export const refresh = async (
  req: Request,
  res: Response
) => {
  try {
    const token = req.body.refreshToken;

    const data = await refreshUserToken(token);

    return successResponse(
      res,
      200,
      "Token refreshed",
      data
    );
  } catch (error) {
    return errorResponse(
      res,
      401,
      error instanceof Error
        ? error.message
        : "Refresh failed"
    );
  }
};

export const logout = async (
  req: Request,
  res: Response
) => {
  try {
    const token = req.body.refreshToken;

    await logoutUser(token);

    return successResponse(
      res,
      200,
      "Logout successful"
    );
  } catch {
    return errorResponse(
      res,
      400,
      "Logout failed"
    );
  }
};