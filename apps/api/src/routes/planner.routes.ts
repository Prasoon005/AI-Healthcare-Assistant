import { Router } from "express";

import { getDailyPlanController } from "../controllers/planner.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getDailyPlanController);

export default router;