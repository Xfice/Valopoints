# Architecture Note — Ajaia Collaborative Docs

## Product slice

This submission adapts an existing Next.js full-stack codebase into a **lightweight collaborative document editor** for the Ajaia assignment. The Valorant dashboard routes remain in the repo but are **not** the primary reviewer path; authenticated users land on `/documents`.

## What was prioritized (4–6 hour scope)

| Priority | Choice | Rationale |
|----------|--------|-----------|
| P0 | Rich-text editing with TipTap | Fast path to bold/italic/underline, headings, lists with JSON persistence |
| P0 | Ownership + email-based sharing | Meets “owner vs shared” requirement without RBAC complexity |
| P0 | SQLite + Prisma | Zero-cost local and deploy-friendly persistence; formatting stored as TipTap JSON |
| P0 | Reuse NextAuth + seeded users | Avoid building auth from scratch; demo accounts for sharing walkthrough |
| P1 | `.txt` / `.md` import | Product-relevant file upload; line-per-paragraph import keeps scope small |
| P2 | Valorant features | Left intact but deprioritized for submission narrative |

## System shape

```
Browser (React / TipTap)
    → Next.js App Router pages (/documents, /documents/[id])
    → API routes (/api/documents/*)
    → Prisma → SQLite (DATABASE_URL)
```

**Session**: NextAuth JWT; `getSession()` guards API routes and server pages.

**Access model**:

- `Document.ownerId` — creator/owner; can delete and share.
- `DocumentShare` — grants edit access to another user by email lookup.
- Lists split **My documents** vs **Shared with me** on `/documents`.

**Save strategy**: Debounced PATCH (800ms) on editor updates and title blur; content validated as JSON server-side.

## Intentional cuts

- No real-time multi-cursor collaboration
- No version history, comments, or export
- Markdown import preserves lines as paragraphs (not full MD → rich conversion)
- Shared users have the same edit rights as owner (no view-only role)
- File upload is import-only (no attachment storage)

## Next 2–4 hours

1. Role-based shares (viewer vs editor)
2. Better Markdown import via HTML → TipTap `generateJSON`
3. Postgres on Vercel + Turso/Neon for production durability
4. Autosave conflict indicator and manual “Save now”
5. Remove or isolate legacy Valorant routes behind a feature flag

## Deployment

Recommended: **Vercel** + persistent SQLite via Turso/libSQL or switch `DATABASE_URL` to free **Neon Postgres** (Prisma provider change). Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, run migrations/seed on deploy.
