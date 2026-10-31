import { defineAction } from "@agent-native/core/action";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { publishDuePosts } from "../server/publish-due-posts.js";

export default defineAction({
  description: "Fetch published posts for RSS feed.",
  schema: z.object({}),
  http: { method: "GET" },
  requiresAuth: false,
  run: async () => {
    const db = getDb();
    await publishDuePosts();
    return db.select().from(schema.posts).where(eq(schema.posts.status, "published")).orderBy(desc(schema.posts.publishedAt)).limit(50);
  },
});
