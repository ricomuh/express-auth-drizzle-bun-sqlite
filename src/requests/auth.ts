import { z } from "zod";
import { validateRequestBody } from "zod-express-middleware";

export const registerRequest = validateRequestBody(
  z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6).max(100),
  })
);

export const loginRequest = validateRequestBody(
  z.object({
    email: z.string().email(),
    password: z.string(),
  })
);

export const resetPasswordRequest = validateRequestBody(
  z.object({
    email: z.string().email(),
  })
);

export const verifyResetPasswordRequest = validateRequestBody(
  z.object({
    email: z.string().email(),
    code: z.string(),
  })
);

export const updatePasswordRequest = validateRequestBody(
  z.object({
    password: z.string().min(6).max(100),
  })
);
