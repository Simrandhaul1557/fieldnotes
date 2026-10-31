import { defineAction, fail } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { requireBlogUser } from "../server/blog-auth.js";
import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "Assign a blog role to a signed-in team member.",
  schema: z.object({ email: z.string().email().max(254), role: z.enum(["author", "editor", "admin"]) }),
  run: async ({ email, role }) => {
    await requireBlogUser(["admin"]);
    const db = getDb();
    const [existing] = await db.select().from(schema.blogUsers).where(eq(schema.blogUsers.email, email)).limit(1);
    if (!existing) fail("That team member has not signed in yet.", { statusCode: 404 });
    const [updated] = await db.update(schema.blogUsers).set({ role }).where(eq(schema.blogUsers.email, email)).returning();
    return updated;
  },
});
