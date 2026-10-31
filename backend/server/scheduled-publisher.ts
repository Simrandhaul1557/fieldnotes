import { publishDuePosts } from "./publish-due-posts.js";

const timer = setInterval(() => {
  void publishDuePosts().catch((error: unknown) => console.error("Scheduled publishing failed", error));
}, 10_000);

timer.unref?.();
