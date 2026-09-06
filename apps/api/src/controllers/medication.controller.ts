import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/response";

import {
  addMedication,
  getTodayMedications,
  takeMedication,
  removeMedication,
} from "../services/medication.service";

import {
  createMedicationSchema,
  medicationLogSchema,
} from "../validations/medication.validation";

/* ================= CREATE MEDICATION ================= */

export const createMedicationController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    const parsed = createMedicationSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        parsed.error.issues[0]?.message || "Invalid medication data"
      );
    }

    const medication = await addMedication(
      userId,
      parsed.data
    );

    return successResponse(
      res,
      201,
      "Medication added successfully",
      medication
    );
  } catch (error) {
    console.error(
      "CREATE MEDICATION ERROR:",
      error
    );

    return errorResponse(
      res,
      500,
      "Failed to add medication"
    );
  }
};

/* ================= GET TODAY'S MEDICATIONS ================= */

export const getTodayMedicationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    const medications =
      await getTodayMedications(userId);

    return successResponse(
      res,
      200,
      "Today's medications fetched",
      medications
    );
  } catch (error) {
    console.error(
      "GET MEDICATIONS ERROR:",
      error
    );

    return errorResponse(
      res,
      500,
      "Failed to fetch medications"
    );
  }
};

/* ================= MARK DOSE AS TAKEN ================= */

export const takeMedicationController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed =
      medicationLogSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        "Invalid scheduled time"
      );
    }

    const medicationId =
      req.params.medicationId as string;

    const logId =
      req.params.logId as string;

    const userId = req.user!.id;

    const result = await takeMedication(
      userId,
      medicationId,
      logId
    );

    return successResponse(
      res,
      200,
      "Dose marked as taken",
      result
    );
  } catch (error) {
    console.error(
      "TAKE MEDICATION ERROR:",
      error
    );

    return errorResponse(
      res,
      404,
      "Medication dose not found"
    );
  }
};

/* ================= DELETE MEDICATION ================= */

export const deleteMedicationController = async (
  req: Request,
  res: Response
) => {
  try {
    const medicationId =
      req.params.medicationId as string;

    await removeMedication(
      req.user!.id,
      medicationId
    );

    return successResponse(
      res,
      200,
      "Medication removed successfully"
    );
  } catch (error) {
    console.error(
      "DELETE MEDICATION ERROR:",
      error
    );

    return errorResponse(
      res,
      404,
      "Medication not found"
    );
  }
};