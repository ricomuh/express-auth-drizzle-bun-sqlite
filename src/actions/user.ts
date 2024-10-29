import { db } from "@/db";
import * as schema from "@/db/schema";
import type { User } from "@/types/auth";
import { NotFoundError } from "@/types/exceptions";
import { eq } from "drizzle-orm";

export async function getUser(uuid: string): Promise<User> {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.uuid, uuid),
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return {
    uuid: user.uuid,
    name: user.name,
    email: user.email || "",
  };
}
