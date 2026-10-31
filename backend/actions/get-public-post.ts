import { defineAction } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { publishDuePosts } from "../server/publish-due-posts.js";

export default defineAction({
  description: "Read a published post by its human-readable slug.",
  schema: z.object({ slug: z.string().min(1).max(180) }),
  http: { method: "GET" },
  requiresAuth: false,
  run: async ({ slug }) => {
    const db = getDb();
    await publishDuePosts();
    const [post] = await db.select().from(schema.posts).where(and(eq(schema.posts.slug, slug), eq(schema.posts.status, "published"))).limit(1);
    return post ?? null;
  },
});
