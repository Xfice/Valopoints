# AI Workflow Note

> **Fill this in honestly before submission.** The template below matches how this project was built; edit the tool names and examples to reflect your actual session.

## Tools used

- **Cursor** (Agent / Composer) — primary implementation and refactoring
- *(Add any others you used, e.g. ChatGPT, Claude, Loom)*

## Where AI sped up work

- Scaffolding Prisma models, API route structure, and TipTap editor wiring from the assignment checklist
- Repetitive UI (document list, toolbar, share form) from existing Tailwind patterns in the repo
- Drafting `ARCHITECTURE.md`, `SUBMISSION.md`, and README sections for reviewer clarity

## What I changed or rejected from AI output

- **Rejected**: Replacing the whole repo vs. **kept** NextAuth/Prisma and added a `/documents` module (smaller risk, faster ship)
- **Edited**: Markdown import — AI suggested heavy HTML pipelines; shipped line-based paragraph import instead (documented limitation)
- **Edited**: Scope — did not remove Valorant routes in this pass; README directs reviewers to `/documents`
- **Verified manually**: Login → create → edit → refresh → share between seeded users; `npm test`; `npm run build`

## Verification approach

- **Correctness**: Vitest unit tests for content helpers; manual API checks via browser network tab
- **UX**: 3–5 min Loom walkthrough covering owned vs shared lists and formatting toolbar
- **Reliability**: `npm run build` before deploy; seed script for reproducible demo accounts
