import { Request, Response } from "express";

import {
  changePassword,
  deleteAccount,
  exportAccountData,
  getAccount,
  logoutAllDevices,
  updateAccount,
} from "../services/account.service";

import {
  changePasswordSchema,
  deleteAccountSchema,
  updateAccountSchema,
} from "../validations/account.validation";

import { successResponse, errorResponse } from "../utils/response";

export const getAccountController = async (req: Request, res: Response) => {
  try {
    const account = await getAccount(req.user!.id);

    return successResponse(
      res,
      200,
      "Account fetched successfully",
      account
    );
  } catch (error) {
    console.error(
      "GET ACCOUNT ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to fetch account");
  }
};

export const updateAccountController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = updateAccountSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Invalid account details"
      );
    }

    const account = await updateAccount(req.user!.id, parsed.data);

    return successResponse(
      res,
      200,
      "Account updated successfully",
      account
    );
  } catch (error) {
    return errorResponse(
      res,
      400,
      error instanceof Error ? error.message : "Failed to update account"
    );
  }
};

export const changePasswordController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Invalid password details"
      );
    }

    await changePassword(req.user!.id, parsed.data);

    return successResponse(res, 200, "Password changed successfully");
  } catch (error) {
    return errorResponse(
      res,
      400,
      error instanceof Error ? error.message : "Failed to change password"
    );
  }
};

export const logoutAllDevicesController = async (
  req: Request,
  res: Response
) => {
  try {
    await logoutAllDevices(req.user!.id);

    return successResponse(res, 200, "Logged out of all devices");
  } catch (error) {
    console.error(
      "LOGOUT ALL DEVICES ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to log out of all devices");
  }
};

export const exportAccountController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await exportAccountData(req.user!.id);

    return successResponse(
      res,
      200,
      "Account data exported successfully",
      data
    );
  } catch (error) {
    console.error(
      "EXPORT ACCOUNT ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to export account data");
  }
};

export const deleteAccountController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = deleteAccountSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Password confirmation is required"
      );
    }

    await deleteAccount(req.user!.id, parsed.data.password);

    return successResponse(res, 200, "Account deleted successfully");
  } catch (error) {
    return errorResponse(
      res,
      400,
      error instanceof Error ? error.message : "Failed to delete account"
    );
  }
};
