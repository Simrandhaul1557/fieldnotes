import { defineAction, fail } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { requireBlogUser } from "../server/blog-auth.js";
import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "Approve or delete a reader comment.",
  schema: z.object({ id: z.string().uuid(), approve: z.boolean() }),
  run: async ({ id, approve }) => {
    await requireBlogUser(["editor", "admin"]);
    const db = getDb();
    if (!approve) {
      const [deleted] = await db.delete(schema.comments).where(eq(schema.comments.id, id)).returning();
      if (!deleted) fail("Comment not found.", { statusCode: 404 });
      return { deleted: true };
    }
    const [updated] = await db.update(schema.comments).set({ status: "approved" }).where(eq(schema.comments.id, id)).returning();
    if (!updated) fail("Comment not found.", { statusCode: 404 });
    return updated;
  },
});
