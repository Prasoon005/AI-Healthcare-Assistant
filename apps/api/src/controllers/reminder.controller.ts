import { Request, Response } from "express";

import {
  addReminder,
  listReminders,
  removeReminder,
} from "../services/reminder.service";

import { createReminderSchema } from "../validations/reminder.validation";

import {
  successResponse,
  errorResponse,
} from "../utils/response";

export const createReminderController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = createReminderSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Invalid reminder data"
      );
    }

    const reminder = await addReminder(req.user!.id, parsed.data);

    return successResponse(
      res,
      201,
      "Reminder created successfully",
      reminder
    );
  } catch (error) {
    console.error(
      "CREATE REMINDER ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to create reminder");
  }
};

export const getRemindersController = async (
  req: Request,
  res: Response
) => {
  try {
    const reminders = await listReminders(req.user!.id);

    return successResponse(
      res,
      200,
      "Reminders fetched successfully",
      reminders
    );
  } catch (error) {
    console.error(
      "GET REMINDERS ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return errorResponse(res, 500, "Failed to fetch reminders");
  }
};

export const deleteReminderController = async (
  req: Request,
  res: Response
) => {
  try {
    await removeReminder(
      req.user!.id,
      req.params.id as string
    );

    return successResponse(
      res,
      200,
      "Reminder removed successfully"
    );
  } catch (error) {
    return errorResponse(res, 404, "Reminder not found");
  }
};
