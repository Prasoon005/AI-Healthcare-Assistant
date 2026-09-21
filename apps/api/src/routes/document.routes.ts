import {
  Router,
} from "express";

import multer from "multer";
import path from "path";
import fs from "fs";

import {
  deleteDocumentController,
  getDocumentController,
  getDocumentsController,
  uploadDocumentController,
} from "../controllers/document.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

const router = Router();

const uploadDirectory =
  path.join(
    process.cwd(),
    "uploads",
    "medical"
  );

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
    }
  );
}

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        uploadDirectory
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const extension =
        path.extname(
          file.originalname
        );

      const filename =
        `${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${extension}`;

      cb(
        null,
        filename
      );
    },
  });

const upload = multer({
  storage,

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (
      allowed.includes(
        file.mimetype
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, JPEG and PNG files are supported."
        )
      );
    }
  },
});

router.use(authenticate);

router.get(
  "/",
  getDocumentsController
);

router.post(
  "/upload",
  upload.single("document"),
  uploadDocumentController
);

router.get(
  "/:documentId",
  getDocumentController
);

router.delete(
  "/:documentId",
  deleteDocumentController
);

export default router;