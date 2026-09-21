import { Router } from "express";

import {
  getAnalyticsController,
  getHistoryController,
  getRecentEventsController,
} from "../controllers/history.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/recent", getRecentEventsController);

router.get("/analytics", getAnalyticsController);

router.get("/", getHistoryController);

export default router;
