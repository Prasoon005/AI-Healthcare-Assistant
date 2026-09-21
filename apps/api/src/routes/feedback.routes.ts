import { Router } from "express";

import { submitFeedbackController } from "../controllers/feedback.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", submitFeedbackController);

export default router;
