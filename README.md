# Ajaia Docs — Collaborative Document Editor

Lightweight full-stack document editor built for the **AI-Native Full Stack Developer** assignment. Uses an existing Next.js 14 codebase (auth, Prisma, API routes) with a new `/documents` experience.

## Quick start (local)

### 1. Install and database

```bash
cp .env.example .env
# Set NEXTAUTH_SECRET and NEXTAUTH_URL=http://localhost:3000 (min 32-char secret)

npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

Uses **SQLite** by default (`DATABASE_URL="file:./dev.db"`). No Docker required for the document editor path.

### 2. Run

```bash
npm run dev
```

Open http://localhost:3000 → login → **Documents** at `/documents`.

### 3. Tests

```bash
npm test
```

## Demo accounts

| Email | Password | Role in demo |
|-------|----------|----------------|
| `alice@demo.local` | `Demo1234!` | Create & share documents |
| `bob@demo.local` | `Demo1234!` | Receives shared documents |
| `admin@valopoints.local` | `Admin1234` | Admin (optional) |

Run `npm run db:seed` after schema changes to ensure demo users exist.

## Main flows

1. **Create** — “New document” on `/documents`
2. **Edit** — Rich toolbar (bold, italic, underline, headings, lists); autosave
3. **Rename** — Edit the title at the top of the editor
4. **Import** — “Import .txt or .md” (max 512 KB; types stated in UI)
5. **Share** — Owner enters collaborator **email** (must be a registered user)

## API (document module)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/documents` | List owned + shared |
| POST | `/api/documents` | Create document |
| GET/PATCH/DELETE | `/api/documents/[id]` | Read / update / delete |
| POST | `/api/documents/[id]/share` | Share with user by email |
| POST | `/api/documents/import` | Multipart file import |

## Deploy (free tier)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set env: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
4. For production DB, prefer **Neon Postgres** or **Turso** (update `provider` in `prisma/schema.prisma` if switching from SQLite)
5. Run `prisma db push` and seed via Vercel build command or one-off script

Add your live URL to `SUBMISSION.md`.

## Submission artifacts

- `ARCHITECTURE.md` — priorities and tradeoffs
- `AI_WORKFLOW.md` — your AI usage note (edit before submit)
- `SUBMISSION.md` — checklist for reviewers
- `VIDEO_URL.txt` — walkthrough link

## Legacy Valorant app

This repo originally tracked Valorant ranked points (`/dashboard`, Henrik API, Redis). Those routes remain for reference but are **out of scope** for the assignment demo. Reviewers should use `/documents` after login.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, Tailwind, TipTap |
| Backend | Next.js API routes |
| Auth | NextAuth (credentials + optional Google) |
| Data | Prisma, SQLite (local) |
