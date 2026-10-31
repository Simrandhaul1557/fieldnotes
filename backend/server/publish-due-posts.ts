import { eq } from "drizzle-orm";

import { getDb, schema } from "./db.js";

export async function publishDuePosts() {
  const db = getDb();
  const scheduled = await db.select({ id: schema.posts.id, scheduledAt: schema.posts.scheduledAt })
    .from(schema.posts).where(eq(schema.posts.status, "scheduled"));
  const now = Date.now();
  await Promise.all(scheduled.filter((post) => post.scheduledAt && Date.parse(post.scheduledAt) <= now)
    .map(({ id }) => db.update(schema.posts).set({ status: "published", publishedAt: new Date(now).toISOString(), updatedAt: new Date(now).toISOString() })
      .where(eq(schema.posts.id, id))));
}
