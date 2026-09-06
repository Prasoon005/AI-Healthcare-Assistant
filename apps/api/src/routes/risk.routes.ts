import { Router } from "express";

import {
  getRiskMatrixController,
} from "../controllers/risk.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  getRiskMatrixController
);

export default router;