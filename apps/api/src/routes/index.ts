import { Router } from "express";

import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import medicationRoutes from "./medication.routes";
import vitalRoutes from "./vital.routes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/vitals", vitalRoutes);
router.use("/users", userRoutes);
router.use("/medications", medicationRoutes);
export default router;