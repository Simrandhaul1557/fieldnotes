import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { requireBlogUser } from "../server/blog-auth.js";
import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "Update a draft's title, Markdown, or tags.",
  schema: z.object({ id: z.string().uuid(), title: z.string().trim().min(1).max(120), markdown: z.string().max(30000), tags: z.string().max(250) }),
  run: async ({ id, title, markdown, tags }) => {
    const user = await requireBlogUser();
    const db = getDb();
    const [post] = await db.select().from(schema.posts).where(eq(schema.posts.id, id)).limit(1);
    if (!post) fail("Post not found.", { statusCode: 404 });
    if (user.role === "author" && post.authorEmail !== user.email) fail("You can only edit your own posts.", { statusCode: 403 });
    if (post.status !== "draft") fail("Only drafts can be edited.", { statusCode: 400 });
    const [updated] = await db.update(schema.posts).set({ title, markdown, tags, excerpt: markdown.replace(/[#*_>`-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180), updatedAt: new Date().toISOString() }).where(and(eq(schema.posts.id, id), eq(schema.posts.status, "draft"))).returning();
    return updated;
  },
});
