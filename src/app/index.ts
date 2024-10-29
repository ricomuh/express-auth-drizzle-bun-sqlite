import express from "express";
import type { Express, Request, Response } from "express";
import {
  login,
  register,
  requestResetPassword,
  verifyResetPassword,
  resetPassword,
  refreshToken,
} from "@/actions/auth";
import type { BasicResponse } from "@/types/response";
import type { User } from "@/types/auth";
import {
  loginRequest,
  registerRequest,
  resetPasswordRequest,
  updatePasswordRequest,
  verifyResetPasswordRequest,
} from "@/requests/auth";
import { authMiddleware } from "@/middleware";
import { ErrorResponse, errorResponse } from "@/types/exceptions";
import { getBearerToken } from "@/lib/auth";
import { getUser } from "@/actions/user";

const app: Express = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Guys! my name is");
});

// get user
app.get(
  "/user",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const user = res.locals.user as User;

    res.json({
      data: user,
    } as BasicResponse<User>);
  }
);

// get specific user
app.get(
  "/user/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await getUser(req.params.id);

      res.json({
        data: user,
      } as BasicResponse<User>);
    } catch (error) {
      const response = errorResponse(error as ErrorResponse);
      res.status(response.status).json(response);
    }
  }
);

// register
app.post(
  "/auth/register",
  registerRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      const result = await register(name, email, password);

      res.status(result.status).json(result);
    } catch (error) {
      const response = errorResponse(error as ErrorResponse);
      res.status(response.status).json(response);
    }
  }
);

// login
app.post(
  "/auth/login",
  loginRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await login(email, password);

      res.json(result);
    } catch (error) {
      const response = errorResponse(error as ErrorResponse);
      res.status(response.status).json(response);
    }
  }
);

// refresh token
app.post(
  "/auth/refresh",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const token = getBearerToken(req);

      if (!token) {
        throw new ErrorResponse("Token not provided", 401, 401);
      }

      const newToken = await refreshToken(token);

      if (!newToken) {
        throw new ErrorResponse("Invalid token", 401, 401);
      }

      res.json({
        data: {
          token: newToken,
        },
      } as BasicResponse<{ token: string }>);
    } catch (error) {
      const response = errorResponse(error as ErrorResponse);
      res.status(response.status).json(response);
    }
  }
);

// reset password request
app.post(
  "/reset-password/request",
  resetPasswordRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      const result = await requestResetPassword(email);

      res.json(result);
    } catch (error) {
      const response = errorResponse(error as ErrorResponse);
      res.status(response.status).json(response);
    }
  }
);

// verify reset password token
app.post(
  "/reset-password/verify",
  verifyResetPasswordRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, code } = req.body;

      const result = await verifyResetPassword(email, code);

      res.json(result);
    } catch (error) {
      const response = errorResponse(error as ErrorResponse);
      res.status(response.status).json(response);
    }
  }
);

// reset password
app.post(
  "/reset-password",
  updatePasswordRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, code, password } = req.body;

      const result = await resetPassword(email, code, password);

      res.json(result);
    } catch (error) {
      const response = errorResponse(error as ErrorResponse);
      res.status(response.status).json(response);
    }
  }
);

export default app;
