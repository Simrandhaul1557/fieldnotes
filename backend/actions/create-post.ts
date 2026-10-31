import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireBlogUser } from "../server/blog-auth.js";
import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "Create a Markdown draft post.",
  schema: z.object({
    title: z.string().trim().min(1, "Add a title.").max(120),
    markdown: z.string().max(30000).default(""),
    tags: z.string().max(250).default(""),
  }),
  run: async ({ title, markdown, tags }) => {
    const user = await requireBlogUser();
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "untitled"}-${crypto.randomUUID().slice(0, 6)}`;
    const [post] = await getDb().insert(schema.posts).values({
      id: crypto.randomUUID(), slug, title, markdown, tags,
      excerpt: markdown.replace(/[#*_>`-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180),
      status: "draft", authorEmail: user.email,
    }).returning();
    return post;
  },
});
