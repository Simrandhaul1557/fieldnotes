import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { requireBlogUser } from "../server/blog-auth.js";
import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "Submit an author's draft to the editor queue.",
  schema: z.object({ id: z.string().uuid() }),
  run: async ({ id }) => {
    const user = await requireBlogUser();
    const db = getDb();
    const [post] = await db.select().from(schema.posts).where(eq(schema.posts.id, id)).limit(1);
    if (!post) fail("Post not found.", { statusCode: 404 });
    if (user.role === "author" && post.authorEmail !== user.email) fail("You can only submit your own posts.", { statusCode: 403 });
    if (post.status !== "draft") fail("Only drafts can be submitted.", { statusCode: 400 });
    const [updated] = await db.update(schema.posts).set({ status: "in_review", updatedAt: new Date().toISOString() }).where(and(eq(schema.posts.id, id), eq(schema.posts.status, "draft"))).returning();
    return updated;
  },
});
