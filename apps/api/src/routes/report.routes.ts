import { Router } from "express";

import {
  askReportQuestionController,
  generateReportController,
  getFollowUpQuestionsController,
  getLatestReportController,
  getReportController,
  getReportsController,
} from "../controllers/report.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/follow-up-questions", getFollowUpQuestionsController);

router.get("/latest", getLatestReportController);

router.post("/", generateReportController);

router.get("/", getReportsController);

router.post("/:id/questions", askReportQuestionController);

router.get("/:id", getReportController);

export default router;
