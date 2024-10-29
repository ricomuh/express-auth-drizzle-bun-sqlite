import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "./actions/auth";
import {
  ErrorResponse,
  internalServerError,
  UnauthorizedError,
} from "./types/exceptions";
import { getBearerToken } from "./lib/auth";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      throw new UnauthorizedError();
    }

    const user = await verifyToken(token);

    if (!user) {
      throw new UnauthorizedError();
    }

    res.locals.user = user;

    next();
  } catch (error) {
    if (error instanceof ErrorResponse) {
      res.status(error.status).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
    return internalServerError;
  }
}
