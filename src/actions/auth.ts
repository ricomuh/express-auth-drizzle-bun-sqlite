import type { Express, Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import bcrypt from "bcryptjs";
import * as schema from "@/db/schema";
import type { LoginResponse, User } from "@/types/auth";
import type { BasicResponse, ErrorResponse } from "@/types/response";
// import jwt
import jwt from "jsonwebtoken";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = getBearerToken(req);

  if (!token) {
    res.status(401).json({
      error: {
        message: "Unauthorized",
      },
      status: 401,
    } as ErrorResponse);
    return;
  }

  const user = await verifyToken(token);

  if (!user) {
    res.status(401).json({
      error: {
        message: "Unauthorized",
      },
      status: 401,
    } as ErrorResponse);
    return;
  }

  res.locals.user = user;

  next();
}

export async function generateToken(user: User): Promise<string> {
  const token = jwt.sign({ user }, process.env.JWT_SECRET || "", {
    expiresIn: "1h",
  });

  await db.insert(schema.tokens).values({
    user_id: user.id,
    token: token,
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  });

  return token;
}

export function getBearerToken(req: Request): string {
  const authorization = req.headers.authorization || "";
  const auth = authorization.split(" ");
  if (auth.length !== 2 || auth[0] !== "Bearer") {
    return "";
  }

  return auth[1];
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "");

    if (typeof decoded === "string") {
      return null;
    }

    const user = decoded as User;

    const tokenExists = await db.query.tokens.findFirst({
      where: eq(schema.tokens.token, token),
    });

    if (!tokenExists) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export async function refreshToken(token: string): Promise<string | null> {
  const user = await verifyToken(token);

  if (!user) {
    return null;
  }

  return generateToken(user);
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<User | ErrorResponse> {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (user) {
    return {
      error: {
        message: "User already exists",
      },
    } as ErrorResponse;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(schema.users)
    .values({
      name: name,
      email: email,
      password: hashedPassword,
    })
    .returning();

  return {
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
    message: "User created",
    status: 201,
  } as BasicResponse<User>;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse | ErrorResponse> {
  // get user
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (!user) {
    return {
      error: {
        message: "User not found",
        code: 404,
      },
      status: 404,
    } as ErrorResponse;
  }

  const isPasswordMatch = await bcrypt.compare(password, user?.password || "");

  if (!isPasswordMatch) {
    return {
      error: {
        message: "Invalid password",
        code: 401,
      },
      status: 401,
    } as ErrorResponse;
  }

  // generate token
  const token = await generateToken({
    id: user.id,
    name: user.name,
    email: user.email || "",
  });

  // find user
  const foundUser = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  return {
    data: {
      token: token,
      user: {
        name: foundUser?.name || "",
        email: foundUser?.email || "",
      },
    },
    message: "Login successful",
    status: 200,
  } as LoginResponse;
}
