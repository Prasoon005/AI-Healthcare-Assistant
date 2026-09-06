import { Router } from "express";
import {
  createMedicationController,
  getTodayMedicationsController,
  takeMedicationController,
  deleteMedicationController,
} from "../controllers/medication.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/today", getTodayMedicationsController);

router.post("/", createMedicationController);

router.patch(
  "/:medicationId/doses/:logId/take",
  takeMedicationController
);

router.delete(
  "/:medicationId",
  deleteMedicationController
);

export default router;