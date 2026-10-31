CREATE TABLE "blog_users" (
	"email" text PRIMARY KEY NOT NULL,
	"role" text DEFAULT 'author' NOT NULL,
	"created_at" text DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"author_name" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"markdown" text DEFAULT '' NOT NULL,
	"tags" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"author_email" text NOT NULL,
	"scheduled_at" text,
	"published_at" text,
	"created_at" text DEFAULT now() NOT NULL,
	"updated_at" text DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
INSERT INTO "posts" ("id", "slug", "title", "excerpt", "markdown", "tags", "status", "author_email", "published_at") VALUES
('11111111-1111-4111-8111-111111111111', 'small-rituals-big-days', 'Small rituals for bigger days', 'The best routines do not ask us to become someone else. They help us arrive as ourselves.', E'## Begin with what is already here\n\nA good morning does not need a complicated system. It needs a little room to breathe, a clear first step, and permission to begin imperfectly.\n\n> Consistency is less about doing everything and more about returning to what matters.\n\n- Leave your notebook open\n- Make one cup of tea\n- Write down the next small thing', 'Rituals,Wellbeing', 'published', 'mara@fieldnotes.example', now()::text),
('22222222-2222-4222-8222-222222222222', 'the-city-between-stops', 'The city between stops', 'A slower commute can reveal the neighborhood we thought we already knew.', E'## An invitation to notice\n\nFor a week, I took the longer route home. Not the scenic route, exactly; just the one with fewer transfers and more time to look around.\n\nI found a tiny bakery, a community garden, and a bench that catches the late afternoon sun.', 'Culture,City', 'published', 'leo@fieldnotes.example', now()::text),
('33333333-3333-4333-8333-333333333333', 'notes-from-a-shared-table', 'Notes from a shared table', 'What happens when dinner becomes a practice of listening?', E'## Make space at the table\n\nThe most memorable meals are rarely the most elaborate. They are the ones where nobody is in a hurry to leave and the conversation keeps finding its way back to the beginning.', 'Food,Community', 'published', 'mara@fieldnotes.example', now()::text),
('44444444-4444-4444-8444-444444444444', 'the-shape-of-a-good-question', 'The shape of a good question', 'A draft waiting for a final editorial pass.', E'## What are we really asking?\n\nThe right question is not always the cleverest one. Sometimes it is the question that gives someone else enough room to answer honestly.', 'Writing,Ideas', 'in_review', 'leo@fieldnotes.example', NULL),
('55555555-5555-4555-8555-555555555555', 'a-garden-in-the-margins', 'A garden in the margins', 'A story about the things that grow when we make a little space.', E'## Leave a little room\n\nNot every empty space needs to be filled. Sometimes the margin is where the most interesting things start to grow.', 'Nature,Slow living', 'scheduled', 'mara@fieldnotes.example', NULL);
UPDATE "posts" SET "scheduled_at" = (now() + interval '1 day')::text WHERE "id" = '55555555-5555-4555-8555-555555555555';
--> statement-breakpoint
INSERT INTO "comments" ("id", "post_id", "author_name", "body", "status") VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Jules', 'This is the gentle reset I needed this week.', 'approved'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '11111111-1111-4111-8111-111111111111', 'Nia', 'I would love to hear more about your notebook practice.', 'pending');
