import { fail } from "@agent-native/core/action";
import { getRequestUserEmail } from "@agent-native/core/server/request-context";
import { eq } from "drizzle-orm";

import { getDb, schema } from "./db.js";

export async function requireBlogUser(roles?: string[]) {
  const email = getRequestUserEmail();
  if (!email) fail("Sign in to continue.", { statusCode: 401 });
  const db = getDb();
  let [user] = await db.select().from(schema.blogUsers).where(eq(schema.blogUsers.email, email)).limit(1);
  if (!user) {
    const existing = await db.select({ email: schema.blogUsers.email }).from(schema.blogUsers).limit(1);
    const role = existing.length === 0 ? "admin" : "author";
    [user] = await db.insert(schema.blogUsers).values({ email, role }).returning();
  }
  if (!user) fail("Could not load your blog profile.", { statusCode: 500 });
  if (roles && !roles.includes(user.role)) fail("You do not have permission to do that.", { statusCode: 403 });
  return user!;
}
