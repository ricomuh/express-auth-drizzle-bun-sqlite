import express from "express";
import type { Express, Request, Response } from "express";
import {
  login,
  register,
  authMiddleware,
  requestResetPassword,
  verifyResetPassword,
  resetPassword,
} from "@/actions/auth";
import type { BasicResponse, ErrorResponse } from "@/types/response";
import type { User, RegisterRequest, LoginRequest } from "@/types/auth";
import {
  loginRequest,
  registerRequest,
  resetPasswordRequest,
  verifyResetPasswordRequest,
} from "@/requests/auth";

const app: Express = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Guys! my name is");
});

// register
app.post(
  "/auth/register",
  registerRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;

    const result = await register(name, email, password);

    if (result.error) {
      res.status(result.status ?? 404).json(result);
      return;
    }

    res.json(result);
  }
);

// login
app.post(
  "/auth/login",
  loginRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const result = await login(email, password);

    if (result.error) {
      res.status(result.error.code ?? 404).json(result);
      return;
    }

    res.json(result);
  }
);

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

// reset password request
app.post(
  "/reset-password/request",
  resetPasswordRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    const result = await requestResetPassword(email);

    if (result.error) {
      res.status(result.error.code ?? 404).json(result);
      return;
    }

    res.json(result);
  }
);

// verify reset password token
app.post(
  "/reset-password/verify",
  verifyResetPasswordRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { email, code } = req.body;

    const result = await verifyResetPassword(email, code);

    if (result.error) {
      res.status(result.error.code ?? 404).json(result);
      return;
    }

    res.json(result);
  }
);

// reset password
app.post(
  "/reset-password",
  resetPasswordRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { email, code, password } = req.body;

    const result = await resetPassword(email, code, password);

    if (result.error) {
      res.status(result.error.code ?? 404).json(result);
      return;
    }

    res.json(result);
  }
);

export default app;
