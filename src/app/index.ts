import express from "express";
import type { Express, Request, Response } from "express";
import { login, register, authMiddleware } from "@/actions/auth";
import type { BasicResponse, ErrorResponse } from "@/types/response";
import type { User, RegisterRequest, LoginRequest } from "@/types/auth";
import { loginRequest, registerRequest } from "@/requests/auth";

const app: Express = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Guys! my name is");
});

// register
app.post(
  "/register",
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
  "/login",
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

export default app;