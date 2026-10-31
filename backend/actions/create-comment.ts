import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "Submit a reader comment for editorial approval.",
  schema: z.object({ postId: z.string().uuid(), authorName: z.string().trim().min(1).max(60), body: z.string().trim().min(1).max(2000) }),
  requiresAuth: false,
  run: async ({ postId, authorName, body }) => {
    const db = getDb();
    const [post] = await db.select({ id: schema.posts.id }).from(schema.posts).where(and(eq(schema.posts.id, postId), eq(schema.posts.status, "published"))).limit(1);
    if (!post) fail("Story not found.", { statusCode: 404 });
    const [comment] = await db.insert(schema.comments).values({
      id: crypto.randomUUID(), postId, authorName, body, status: "pending",
    }).returning();
    return comment;
  },
});
