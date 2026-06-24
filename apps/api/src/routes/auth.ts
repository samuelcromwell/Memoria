import bcrypt from "bcryptjs";
import { Router, type Response } from "express";
import passport from "passport";
import { z } from "zod";
import { env, googleOAuthEnabled } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import type { SafeUser } from "../types/auth.js";
import { toSafeUser } from "../types/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

const setupPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8)
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

router.get(
  "/oauth/google",
  (req, res, next) => {
    if (!googleOAuthEnabled) {
      next(new ApiError(503, "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."));
      return;
    }

    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account"
    })(req, res, next);
  }
);

router.post("/oauth/google", (_req, res) => {
  res.redirect(303, "/api/auth/oauth/google");
});

function redirectAuthFailure(res: Response, reason: string): void {
  const params = new URLSearchParams({ auth: "error", reason });
  res.redirect(`${env.FRONTEND_URL}/?${params.toString()}`);
}

router.get("/oauth/google/callback", (req, res, next) => {
  if (!googleOAuthEnabled) {
    res.redirect(`${env.FRONTEND_URL}/?auth=google-not-configured`);
    return;
  }

  passport.authenticate("google", (error: unknown, user: SafeUser | false) => {
    if (error) {
      console.error("Google OAuth callback failed", error);
      redirectAuthFailure(res, "google-auth-failed");
      return;
    }

    if (!user) {
      redirectAuthFailure(res, "google-auth-failed");
      return;
    }

    req.logIn(user, (loginError) => {
      if (loginError) {
        console.error("Failed to persist OAuth session", loginError);
        redirectAuthFailure(res, "session-failed");
        return;
      }

      res.redirect(user.hasPassword ? `${env.FRONTEND_URL}/dashboard` : `${env.FRONTEND_URL}/setup-password`);
    });
  })(req, res, next);
});

router.post(
  "/setup-password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = setupPasswordSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { passwordHash }
    });

    res.json({ user: toSafeUser(user) });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });

    if (!user?.passwordHash) {
      throw new ApiError(401, "Invalid email or password");
    }

    const matches = await bcrypt.compare(body.password, user.passwordHash);
    if (!matches) {
      throw new ApiError(401, "Invalid email or password");
    }

    const safeUser = toSafeUser(user);
    await new Promise<void>((resolve, reject) => {
      req.logIn(safeUser, (error) => (error ? reject(error) : resolve()));
    });

    res.json({ user: safeUser });
  })
);

router.post("/logout", requireAuth, (req, res, next) => {
  req.logout((logoutError) => {
    if (logoutError) {
      next(logoutError);
      return;
    }

    req.session.destroy((destroyError) => {
      if (destroyError) {
        next(destroyError);
        return;
      }

      res.clearCookie("memoria.sid");
      res.status(204).send();
    });
  });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export { router as authRouter };
