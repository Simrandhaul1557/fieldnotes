import { defineAction } from "@agent-native/core/action";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { requireBlogUser } from "../server/blog-auth.js";
import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "List approved comments for readers or all comments for editors.",
  schema: z.object({ postId: z.string().uuid() }),
  http: { method: "GET" },
  requiresAuth: false,
  run: async ({ postId }) => {
    let editor = false;
    try { editor = ["admin", "editor"].includes((await requireBlogUser()).role); } catch { editor = false; }
    return getDb().select().from(schema.comments).where(editor ? eq(schema.comments.postId, postId) : and(eq(schema.comments.postId, postId), eq(schema.comments.status, "approved"))).orderBy(asc(schema.comments.createdAt));
  },
});
