import { z } from "zod";
import { validateRequestBody } from "zod-express-middleware";

export const registerRequest = validateRequestBody(
  z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
  })
);

export const loginRequest = validateRequestBody(
  z.object({
    email: z.string().email(),
    password: z.string(),
  })
);
