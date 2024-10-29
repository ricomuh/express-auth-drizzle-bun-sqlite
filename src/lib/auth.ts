import type { Request } from "express";

export function getBearerToken(req: Request): string {
  const authorization = req.headers.authorization || "";
  const auth = authorization.split(" ");
  if (auth.length !== 2 || auth[0] !== "Bearer") {
    return "";
  }

  return auth[1];
}
