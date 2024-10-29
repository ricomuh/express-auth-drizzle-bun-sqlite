import type { Express, Request, Response, NextFunction } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import bcrypt from "bcryptjs";
import * as schema from "@/db/schema";
import type { LoginResponse, User } from "@/types/auth";
import type { BasicResponse, BasicErrorResponse } from "@/types/response";
// import jwt
import jwt from "jsonwebtoken";
import { sendEmail } from "./email";
import {
  ErrorResponse,
  internalServerError,
  UnauthorizedError,
} from "@/types/exceptions";

export async function generateToken(user: User): Promise<string> {
  const token = jwt.sign({ user }, process.env.JWT_SECRET || "", {
    expiresIn: "1h",
  });

  await db.insert(schema.tokens).values({
    uuid: crypto.randomUUID(),
    user_id: user.uuid,
    token: token,
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  });

  return token;
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
): Promise<User | BasicErrorResponse> {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });
  if (user) {
    throw new ErrorResponse("User already exists", 409, 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(schema.users)
    .values({
      uuid: crypto.randomUUID(),
      name: name,
      email: email,
      password: hashedPassword,
    })
    .returning();

  return {
    data: {
      uuid: newUser.uuid,
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
): Promise<LoginResponse | BasicErrorResponse> {
  // get user
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (!user) {
    throw new ErrorResponse("User not found", 404, 404);
  }

  const isPasswordMatch = await bcrypt.compare(password, user?.password || "");

  if (!isPasswordMatch) {
    throw new ErrorResponse("Invalid password", 401, 401);
  }

  // generate token
  const token = await generateToken({
    uuid: user.uuid,
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

export async function requestResetPassword(
  email: string
): Promise<BasicResponse<null> | BasicErrorResponse> {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (!user) {
    throw new ErrorResponse("User not found", 404, 404);
  }

  const [resetPassword] = await db
    .insert(schema.resetPasswords)
    .values({
      uuid: crypto.randomUUID(),
      user_id: user.uuid,
      code: (1000 + Math.floor(Math.random() * 9999)).toString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    })
    .returning();

  // send email
  await sendEmail(
    email,
    "Reset Password",
    `Your verification code is ${resetPassword.code}`
  );

  return {
    message: "Reset password request sent",
    status: 200,
  } as BasicResponse<null>;
}

export async function verifyResetPassword(
  email: string,
  code: string
): Promise<BasicResponse<null> | BasicErrorResponse> {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (!user) {
    throw new ErrorResponse("User not found", 404, 404);
  }

  const resetPassword = await db.query.resetPasswords.findFirst({
    where: and(
      eq(schema.resetPasswords.user_id, user.uuid),
      eq(schema.resetPasswords.code, code)
    ),
  });

  if (!resetPassword) {
    return {
      error: {
        message: "Invalid verification code",
        code: 401,
      },
      status: 401,
    } as BasicErrorResponse;
  }

  // check if token is expired
  if (new Date(resetPassword.expires_at || "") < new Date()) {
    throw new ErrorResponse("Token expired", 401, 401);
  }

  return {
    message: "Token verified",
    status: 200,
  } as BasicResponse<null>;
}

export async function resetPassword(
  email: string,
  code: string,
  password: string
): Promise<BasicResponse<null> | BasicErrorResponse> {
  const verify = await verifyResetPassword(email, code);

  if (verify.error) {
    throw new ErrorResponse(
      verify.error.message,
      verify.error.code,
      verify.status
    );
  }
  // update password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (!user) {
    throw new ErrorResponse("User not found", 404, 404);
  }

  await db
    .update(schema.users)
    .set({
      password: hashedPassword,
    })
    .where(eq(schema.users.uuid, user.uuid));

  // remove all the tokens of this user
  await db.delete(schema.tokens).where(eq(schema.tokens.user_id, user.uuid));

  // remove the reset password token
  await db
    .delete(schema.resetPasswords)
    .where(eq(schema.resetPasswords.user_id, user.uuid));

  return {
    message: "Password reset successful.",
    status: 200,
  } as BasicResponse<null>;
}
