import { Router } from "express";

import {
  createReminderController,
  deleteReminderController,
  getRemindersController,
} from "../controllers/reminder.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", createReminderController);

router.get("/", getRemindersController);

router.delete("/:id", deleteReminderController);

export default router;
