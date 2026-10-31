import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireBlogUser } from "../server/blog-auth.js";

export default defineAction({
  description: "Get the signed-in user's blog role.",
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => requireBlogUser(),
});
