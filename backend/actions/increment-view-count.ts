import { defineAction } from "@agent-native/core/action";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "Increment the view count for a post.",
  schema: z.object({ slug: z.string().min(1).max(180) }),
  http: { method: "POST" },
  requiresAuth: false,
  run: async ({ slug }) => {
    const db = getDb();
    await db.update(schema.posts)
      .set({ viewCount: sql`${schema.posts.viewCount} + 1` })
      .where(eq(schema.posts.slug, slug));
    return { success: true };
  },
});
