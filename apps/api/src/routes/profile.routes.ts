import { Router } from "express";

import {
  getProfileController,
  updateProfileController,
} from "../controllers/profile.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getProfileController);

router.put("/", updateProfileController);

export default router;
