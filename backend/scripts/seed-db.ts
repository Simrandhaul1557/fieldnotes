import { getDb, schema } from "../server/db.js";

async function main() {
  const db = getDb();

  // Insert blog users
  await db.insert(schema.blogUsers).values([
    { email: "mara@fieldnotes.example", role: "author" },
    { email: "leo@fieldnotes.example", role: "author" },
  ]).onConflictDoNothing();

  // Insert posts
  await db.insert(schema.posts).values([
    {
      id: "11111111-1111-4111-8111-111111111111",
      slug: "small-rituals-big-days",
      title: "Small rituals for bigger days",
      excerpt: "The best routines do not ask us to become someone else. They help us arrive as ourselves.",
      markdown: `## Begin with what is already here

A good morning does not need a complicated system. It needs a little room to breathe, a clear first step, and permission to begin imperfectly.

> Consistency is less about doing everything and more about returning to what matters.

- Leave your notebook open
- Make one cup of tea
- Write down the next small thing`,
      tags: "Rituals,Wellbeing",
      status: "published",
      authorEmail: "mara@fieldnotes.example",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      slug: "the-city-between-stops",
      title: "The city between stops",
      excerpt: "A slower commute can reveal the neighborhood we thought we already knew.",
      markdown: `## An invitation to notice

For a week, I took the longer route home. Not the scenic route, exactly; just the one with fewer transfers and more time to look around.

I found a tiny bakery, a community garden, and a bench that catches the late afternoon sun.`,
      tags: "Culture,City",
      status: "published",
      authorEmail: "leo@fieldnotes.example",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      slug: "notes-from-a-shared-table",
      title: "Notes from a shared table",
      excerpt: "What happens when dinner becomes a practice of listening?",
      markdown: `## Make space at the table

The most memorable meals are rarely the most elaborate. They are the ones where nobody is in a hurry to leave and the conversation keeps finding its way back to the beginning.`,
      tags: "Food,Community",
      status: "published",
      authorEmail: "mara@fieldnotes.example",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "44444444-4444-4444-8444-444444444444",
      slug: "the-shape-of-a-good-question",
      title: "The shape of a good question",
      excerpt: "A draft waiting for a final editorial pass.",
      markdown: `## What are we really asking?

The right question is not always the cleverest one. Sometimes it is the question that gives someone else enough room to answer honestly.`,
      tags: "Writing,Ideas",
      status: "in_review",
      authorEmail: "leo@fieldnotes.example",
    },
    {
      id: "55555555-5555-4555-8555-555555555555",
      slug: "a-garden-in-the-margins",
      title: "A garden in the margins",
      excerpt: "A story about the things that grow when we make a little space.",
      markdown: `## Leave a little room

Not every empty space needs to be filled. Sometimes the margin is where the most interesting things start to grow.`,
      tags: "Nature,Slow living",
      status: "scheduled",
      authorEmail: "mara@fieldnotes.example",
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    },
  ]).onConflictDoNothing();

  // Insert comments
  await db.insert(schema.comments).values([
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      postId: "11111111-1111-4111-8111-111111111111",
      authorName: "Jules",
      body: "This is the gentle reset I needed this week.",
      status: "approved",
    },
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      postId: "11111111-1111-4111-8111-111111111111",
      authorName: "Nia",
      body: "I would love to hear more about your notebook practice.",
      status: "pending",
    },
  ]).onConflictDoNothing();

  console.log("Database seeded successfully!");
}

main().catch(console.error);
