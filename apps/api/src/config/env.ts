import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";
import { normalizeDatabaseUrl } from "./databaseUrl.js";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const envPaths = [
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(moduleDir, "../../../../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(moduleDir, "../../.env")
];

for (const envPath of [...new Set(envPaths)]) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().optional(),
  API_PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1).default("mysql://memoria:memoria@localhost:3306/memoria"),
  SESSION_SECRET: z.string().min(16).default("dev-session-secret-change-me"),
  UPLOAD_DIR: z.string().min(1).default("./uploads"),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(50),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z
    .string()
    .url()
    .default("http://localhost:4000/api/auth/oauth/google/callback")
});

const parsedEnv = envSchema.parse(process.env);
const databaseUrl = normalizeDatabaseUrl(parsedEnv.DATABASE_URL, parsedEnv.NODE_ENV);

process.env.DATABASE_URL = databaseUrl;

export const env = {
  ...parsedEnv,
  DATABASE_URL: databaseUrl,
  API_PORT: parsedEnv.PORT ?? parsedEnv.API_PORT
};

if (env.NODE_ENV === "production" && env.SESSION_SECRET === "dev-session-secret-change-me") {
  throw new Error("SESSION_SECRET must be set to a strong value in production.");
}

export const googleOAuthEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
