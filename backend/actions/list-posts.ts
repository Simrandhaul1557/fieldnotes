import { defineAction } from "@agent-native/core/action";
import { desc } from "drizzle-orm";
import { z } from "zod";

import { requireBlogUser } from "../server/blog-auth.js";
import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "List posts available in the signed-in editorial workspace.",
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => {
    const user = await requireBlogUser();
    const rows = await getDb().select().from(schema.posts).orderBy(desc(schema.posts.updatedAt));
    return user.role === "author" ? rows.filter((post) => post.authorEmail === user.email) : rows;
  },
});
