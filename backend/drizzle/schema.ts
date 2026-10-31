import { sql } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

export const blogUsers = pgTable("blog_users", {
  email: text("email").primaryKey(),
  role: text("role").notNull().default("author"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  markdown: text("markdown").notNull().default(""),
  tags: text("tags").notNull().default(""),
  status: text("status").notNull().default("draft"),
  authorEmail: text("author_email").notNull(),
  scheduledAt: text("scheduled_at"),
  publishedAt: text("published_at"),
  viewCount: text("view_count").notNull().default("0"),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull(),
  authorName: text("author_name").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});
