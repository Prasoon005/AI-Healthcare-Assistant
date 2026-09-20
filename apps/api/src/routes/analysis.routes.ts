import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";

import {
  createAnalysisController,
  getAnalysisController,
  getAnalysisHistoryController,
  getLatestAnalysisController,
  quickCheckController,
  submitAnalysisFeedbackController,
} from "../controllers/analysis.controller";

import { authenticate } from "../middleware/auth.middleware";
import { errorResponse } from "../utils/response";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WEBP images are supported."));
    }
  },
});

const uploadPhoto = (req: Request, res: Response, next: NextFunction) => {
  upload.single("photo")(req, res, (err: unknown) => {
    if (err) {
      return errorResponse(
        res,
        400,
        err instanceof Error ? err.message : "Invalid photo upload"
      );
    }

    next();
  });
};

router.use(authenticate);

router.post("/", uploadPhoto, createAnalysisController);

router.get("/", getAnalysisHistoryController);

router.post("/quick-check", quickCheckController);

router.get("/latest", getLatestAnalysisController);

router.patch("/:id/feedback", submitAnalysisFeedbackController);

router.get("/:id", getAnalysisController);

export default router;
