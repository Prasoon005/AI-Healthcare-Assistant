import { Router } from "express";

import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import medicationRoutes from "./medication.routes";
const router = Router();

router.use("/auth", authRoutes);

router.use("/users", userRoutes);
router.use("/medications", medicationRoutes);
export default router;