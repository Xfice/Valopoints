# Submission Checklist — Ajaia Collaborative Docs

## Included in this folder

| Item | Location |
|------|----------|
| Source code | Repository root |
| README (setup & run) | `README.md` |
| Architecture note | `ARCHITECTURE.md` |
| AI workflow note | `AI_WORKFLOW.md` (complete before upload) |
| Walkthrough video URL | `VIDEO_URL.txt` (add your Loom/YouTube link) |
| Live deployment URL | *(add below after deploy)* |

**Live URL:** _TODO — e.g. https://your-app.vercel.app_

## Demo accounts (sharing flow)

| User | Email | Password |
|------|-------|----------|
| Alice | `alice@demo.local` | `Demo1234!` |
| Bob | `bob@demo.local` | `Demo1234!` |
| Admin | `admin@valopoints.local` (or `ADMIN_EMAIL`) | `Admin1234` (or `ADMIN_PASSWORD`) |

**Sharing demo:** Log in as Alice → create/open a document → Share → enter `bob@demo.local` → log in as Bob → see doc under **Shared with me**.

## Feature status

### Working

- Create, rename (title field), edit, autosave, reopen after refresh
- Rich text: bold, italic, underline, H1/H2, bullet/numbered lists
- Import `.txt` / `.md` (max 512 KB)
- Owner vs shared document lists
- Share by collaborator email
- Persistence via Prisma + SQLite
- Automated test: `npm test`

### Incomplete / deprioritized

- Real-time collaboration, version history, PDF export
- View-only share role
- Full Markdown → rich-text conversion
- Legacy Valorant dashboard (still in repo, not part of demo path)

### If I had 2–4 more hours

- Deploy on Vercel with hosted Postgres
- Viewer vs editor permissions
- Polish login/home branding for Ajaia-only narrative
- E2E test with Playwright for share flow

## Google Drive upload

Zip or clone this repo into your Drive folder together with `VIDEO_URL.txt` and confirm the live URL above works for reviewers.
