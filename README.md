# Fieldnotes

A thoughtful blogging platform where authors write posts in Markdown, editors review and publish them, and readers comment. Built with Agent-Native framework, React Router, and PostgreSQL/PGlite.

## Features

### Core Features
- **Role-based access**: Authors, editors, and admins with different permissions
- **Markdown editor**: Authors write posts with live preview and save drafts
- **Editorial workflow**: Editors review submitted posts, publish immediately or schedule for later
- **Public pages**: Post list with tags, individual post pages at readable URLs (slugs), and search
- **Comment system**: Readers can comment; editors approve or delete comments before they appear
- **Scheduled publishing**: Posts go live automatically at their scheduled time
- **Safe Markdown rendering**: Custom renderer prevents script injection

### Stretch Features
- **Reading time**: Calculated and displayed on post pages
- **RSS feed**: Implemented at `/rss.xml`
- **View counts**: Implemented and displayed on post pages

## Data Model

### Tables
- **blog_users**: User roles (author, editor, admin)
- **posts**: Posts with status (draft, in_review, scheduled, published), markdown content, tags, and scheduling
- **comments**: Reader comments with moderation status (pending, approved)

### Design Decisions
- **PGlite for development**: Embedded PostgreSQL for local development, easy to reset
- **PostgreSQL for production**: Standard PostgreSQL for production deployment
- **Custom Markdown renderer**: Safe text-based rendering instead of HTML to prevent XSS
- **Slug-based URLs**: Human-readable URLs for posts (e.g., `/posts/small-rituals-big-days`)
- **Status-based workflow**: Draft → In Review → Scheduled/Published for editorial control

## Develop locally

```bash
cp .env.example .env
corepack enable
pnpm install
pnpm setup:links
pnpm dev
```

`pnpm install` runs `setup:links` automatically. Run it manually if you cloned
without lifecycle scripts; it recreates the framework compatibility links after
a fresh checkout.

The app will run on http://localhost:8081.

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (for production)
- `DATABASE_URL_UNPOOLED`: Direct PostgreSQL connection for migrations
- `AUTH_DISABLED`: Set to `true` to skip authentication during development
- `AGENT_NATIVE_REALTIME_HMAC_SECRET`: Random secret for real-time sync

### Seeding the Database
After starting the dev server, visit http://localhost:8081/seed to populate the database with sample posts, comments, and users.

## Demo Logins

To test the app without creating accounts, use these demo credentials (after seeding):

**Authors:**
- mara@fieldnotes.example (author)
- leo@fieldnotes.example (author)

**Admin:**
- Sign up with any email, then use the Team panel in the studio to assign roles

## Project Layout

Source is organized by side:

- `frontend/`: React Router frontend
  - `app/`: Routes, UI components, hooks, and client utilities
    - `routes/`: File-based page routes (_index.tsx, studio.tsx, posts.$slug.tsx)
    - `components/`: Reusable UI components
    - `hooks/`: Custom React hooks
  - `public/`: Static assets
  - `tests/`: Frontend tests
- `backend/`: server-side code
  - `actions/`: Shared operations (defineAction; used by the UI and the agent)
  - `server/`: Nitro API server
    - `routes/`: Server-side API routes
    - `plugins/`: Server plugins (auth, config)
    - `db.ts`: Database client
  - `drizzle/`: Database schema and migrations
  - `scripts/`: Migration and seed scripts
- `shared/`: Code shared by both ends (alias `@shared`)
- `data/`: Local runtime data (PGlite)

The Agent-Native CLI expects `app/`, `server/`, `actions/`, and `drizzle/` at the project root. Those root entries are generated links (Windows junctions, symlinks elsewhere) into `frontend/` and `backend/`, so framework commands keep working while the real files live in the organized folders. They are gitignored and recreated by `pnpm setup:links`. Edit files under `frontend/` or `backend/`, not through the root links.

## What's Finished

✅ All core features implemented
✅ Role-based authentication and authorization
✅ Markdown editor with live preview
✅ Editorial workflow (draft → review → publish/schedule)
✅ Public post listing with tags and search
✅ Individual post pages with comments
✅ Comment moderation system
✅ Scheduled post auto-publishing
✅ Safe Markdown rendering
✅ Responsive design (mobile and desktop)
✅ Server-side input validation with Zod
✅ 5+ automated tests for backend logic
✅ Seed script for demo data

## What's Not Finished

❌ Email notifications for new comments

## What I Would Do With More Time

1. **Email notifications**: Notify authors when comments are approved
2. **Rich text editor**: Enhance Markdown editor with toolbar and preview
3. **Image uploads**: Allow authors to upload images for posts
4. **Analytics dashboard**: Show post performance metrics to authors
5. **Draft collaboration**: Allow multiple authors to collaborate on drafts
6. **Version history**: Track post revisions and allow rollbacks

## AI Tools Used

- **Cascade (Claude):** Used for code generation, debugging, and implementation guidance throughout the project
- **Agent-Native framework:** Provided the full-stack framework with built-in auth, database, and real-time sync

## Testing

Run tests with:
```bash
pnpm test
```

Tests cover:
- Post creation and validation
- Post submission workflow
- Post review and publishing
- Comment creation and moderation
- Role-based access control

Framework docs: [agent-native.com/docs](https://agent-native.com/docs?utm_source=github&utm_medium=referral&utm_content=fusion-starter-readme).
