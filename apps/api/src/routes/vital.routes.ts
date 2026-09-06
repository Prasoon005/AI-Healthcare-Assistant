import { Router } from "express";

import {
  createVitalController,
  getVitalsController,
  deleteVitalController,
} from "../controllers/vital.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", createVitalController);

router.get("/", getVitalsController);

router.delete("/:id", deleteVitalController);

export default router;