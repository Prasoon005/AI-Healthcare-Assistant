import { Router } from "express";

import {
  changePasswordController,
  deleteAccountController,
  exportAccountController,
  getAccountController,
  logoutAllDevicesController,
  updateAccountController,
} from "../controllers/account.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getAccountController);

router.patch("/", updateAccountController);

router.patch("/password", changePasswordController);

router.post("/logout-all", logoutAllDevicesController);

router.get("/export", exportAccountController);

router.delete("/", deleteAccountController);

export default router;
