import { defineAction, fail } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { requireBlogUser } from "../server/blog-auth.js";
import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "Publish a reviewed post now or schedule it for a future time.",
  schema: z.object({ id: z.string().uuid(), scheduledAt: z.string().datetime().optional() }),
  run: async ({ id, scheduledAt }) => {
    await requireBlogUser(["editor", "admin"]);
    const db = getDb();
    const [post] = await db.select().from(schema.posts).where(eq(schema.posts.id, id)).limit(1);
    if (!post) fail("Post not found.", { statusCode: 404 });
    if (post.status !== "in_review") fail("Only submitted posts can be published.", { statusCode: 400 });
    if (scheduledAt && new Date(scheduledAt).getTime() <= Date.now()) fail("Choose a future publish time.", { statusCode: 400 });
    const now = new Date().toISOString();
    const [updated] = await db.update(schema.posts).set({
      status: scheduledAt ? "scheduled" : "published",
      scheduledAt: scheduledAt ?? null,
      publishedAt: scheduledAt ? null : now,
      updatedAt: now,
    }).where(eq(schema.posts.id, id)).returning();
    return updated;
  },
});
