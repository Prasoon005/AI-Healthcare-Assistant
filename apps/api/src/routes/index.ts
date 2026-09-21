import { Router } from "express";

import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import medicationRoutes from "./medication.routes";
import vitalRoutes from "./vital.routes";
import riskRoutes from "./risk.routes";
import documentRoutes from "./document.routes";
import plannerRoutes from "./planner.routes";
import profileRoutes from "./profile.routes";
import analysisRoutes from "./analysis.routes";
import reminderRoutes from "./reminder.routes";
import reportRoutes from "./report.routes";
import historyRoutes from "./history.routes";
import accountRoutes from "./account.routes";
import feedbackRoutes from "./feedback.routes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/vitals", vitalRoutes);
router.use("/users", userRoutes);
router.use("/medications", medicationRoutes);
router.use("/risk-matrix", riskRoutes);
router.use(
  "/documents",
  documentRoutes
);
router.use("/planner", plannerRoutes);
router.use("/profile", profileRoutes);
router.use("/analysis", analysisRoutes);
router.use("/reminders", reminderRoutes);
router.use("/reports", reportRoutes);
router.use("/history", historyRoutes);
router.use("/account", accountRoutes);
router.use("/feedback", feedbackRoutes);
export default router;