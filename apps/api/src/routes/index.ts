import { Router } from "express";

import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import medicationRoutes from "./medication.routes";
import vitalRoutes from "./vital.routes";
import riskRoutes from "./risk.routes";
import documentRoutes from "./document.routes";
import plannerRoutes from "./planner.routes";
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
export default router;