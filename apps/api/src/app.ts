import cors from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import { configurePassport } from "./config/passport.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { PrismaSessionStore } from "./lib/prismaSessionStore.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { filesRouter } from "./routes/files.js";
import { errorHandler, notFound } from "./utils/errors.js";

const sevenDaysMs = 1000 * 60 * 60 * 24 * 7;

export function createApp() {
  configurePassport(prisma);

  const app = express();
  const store = new PrismaSessionStore(prisma, sevenDaysMs);

  app.set("trust proxy", 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  if (env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  app.use(
    session({
      name: "memoria.sid",
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        httpOnly: true,
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        secure: env.NODE_ENV === "production",
        maxAge: sevenDaysMs
      }
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  const cleanupTimer = setInterval(() => {
    void store.clearExpired().catch((error) => console.error("Failed to clear expired sessions", error));
  }, 1000 * 60 * 60);
  cleanupTimer.unref();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/files", filesRouter);
  app.use("/api/dashboard", dashboardRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
