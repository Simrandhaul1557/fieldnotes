import { defineAction } from "@agent-native/core/action";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { publishDuePosts } from "../server/publish-due-posts.js";

export default defineAction({
  description: "Search public posts by title, excerpt, or tag.",
  schema: z.object({ query: z.string().max(120).default("") }),
  http: { method: "GET" },
  requiresAuth: false,
  run: async ({ query }) => {
    const db = getDb();
    await publishDuePosts();
    const filters = query.trim() ? or(
      ilike(schema.posts.title, `%${query.trim()}%`),
      ilike(schema.posts.excerpt, `%${query.trim()}%`),
      ilike(schema.posts.tags, `%${query.trim()}%`),
    ) : undefined;
    return db.select().from(schema.posts).where(and(eq(schema.posts.status, "published"), filters)).orderBy(desc(schema.posts.publishedAt));
  },
});
