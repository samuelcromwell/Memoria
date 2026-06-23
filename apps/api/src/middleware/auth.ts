import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/errors.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (req.isAuthenticated?.() && req.user) {
    next();
    return;
  }

  next(new ApiError(401, "Authentication required"));
}
