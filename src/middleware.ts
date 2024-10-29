import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "./actions/auth";
import {
  errorResponse,
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
    const response =
      errorResponse(error as ErrorResponse) || internalServerError;
    res.status(response.status).json(response);
  }
}
