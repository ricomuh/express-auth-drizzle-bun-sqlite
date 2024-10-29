import express from "express";
import type { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { login, register, authMiddleware } from "./actions/auth";
import { error } from "console";
import type { BasicResponse, ErrorResponse } from "./types/response";
import type { User, RegisterRequest, LoginRequest } from "./types/auth";
import { loginRequest, registerRequest } from "./requests/auth";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
