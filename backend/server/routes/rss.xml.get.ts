import { defineEventHandler } from "h3";
import { desc, eq } from "drizzle-orm";

import { getDb, schema } from "../db.js";
import { publishDuePosts } from "../publish-due-posts.js";

export default defineEventHandler(async () => {
  const db = getDb();
  await publishDuePosts();
  const posts = await db.select().from(schema.posts).where(eq(schema.posts.status, "published")).orderBy(desc(schema.posts.publishedAt)).limit(50);
  
  const baseUrl = "http://localhost:8081";
  const feedDate = new Date().toUTCString();
  
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Fieldnotes</title>
    <description>A thoughtful journal for the stories, observations, and small details worth keeping.</description>
    <link>${baseUrl}/</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${feedDate}</lastBuildDate>
    ${(posts as any[]).map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.excerpt)}</description>
      <link>${baseUrl}/posts/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/posts/${post.slug}</guid>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : feedDate}</pubDate>
      <category>${escapeXml(post.tags.split(',')[0]?.trim() || 'Fieldnotes')}</category>
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
