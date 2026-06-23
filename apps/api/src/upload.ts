import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { nanoid } from "nanoid";
import { env } from "./config/env.js";

const storage = multer.diskStorage({
  destination: (req, _file, callback) => {
    const userId = req.user?.id ?? "anonymous";
    const directory = path.resolve(env.UPLOAD_DIR, `user-${userId}`);
    fs.mkdirSync(directory, { recursive: true });
    callback(null, directory);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).slice(0, 24);
    callback(null, `${nanoid(20)}${extension}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
    files: 1
  }
});
