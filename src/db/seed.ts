import { db } from "@/db";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

const password = await bcrypt.hash("password", 10);

await db.insert(schema.users).values([
  {
    name: "John Doe",
    email: "jhon.doe@mail.com",
    password: password,
  },
  {
    name: "Jane Doe",
    email: "jane.doe@mail.com",
    password: password,
  },
  {
    name: "Soe Geng",
    email: "soe.geng@mail.com",
    password: password,
  },
]);

console.log(`Seeding complete.`);
