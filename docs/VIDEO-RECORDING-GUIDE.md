# Job Application Video Recording Guide

## Tech Stack (as requested)

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Next.js, Tailwind CSS |
| **Backend** | Node.js |
| **APIs & Data** | GraphQL, REST API, Prisma, Postgres, Redis |
| **DevOps & Tools** | Docker, VSCode, CoPilot, GitHub |

## Requirements Checklist

- [ ] **Single Node.js app** – ValoPoints Next (this project)
- [ ] **Running locally** – `npm run dev` → http://localhost:3000
- [ ] **Browser DevTools** – Inspect tab in **vertical layout**, show Network, Sources, Console
- [ ] **IDE** – Show project file structure (VSCode)
- [ ] **4–8 minutes** – Focus more on **code and data requests** than UI demo
- [ ] **English** – Explain in English
- [ ] **Unscripted** – Record live, be yourself
- [ ] **Streaming link** – YouTube (Loom/Google Drive not accepted)

## Quick Start

```bash
# 1. Start PostgreSQL & Redis (Docker)
docker compose up -d

# 2. Setup
cp .env.example .env
# Add HENRIK_API_KEY to .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed

# 3. Run
npm run dev
```

## What to Show in the Video

### 1. IDE (VSCode) – Project Structure
- `src/app/` – Next.js pages (React)
- `src/app/api/` – REST API routes
- `src/app/api/graphql/` – GraphQL endpoint
- `src/services/` – Valorant API, points calculator
- `prisma/schema.prisma` – Database schema
- `docker-compose.yml` – Postgres + Redis

### 2. REST API
- `POST /api/auth/login` – Login
- `POST /api/dashboard/link` – Link Riot account
- `POST /api/dashboard/refresh` – Fetch matches from Henrik API

### 3. GraphQL
- Open http://localhost:3000/api/graphql
- Run query:
```graphql
query {
  leaderboard(limit: 10) {
    rank
    displayName
    points
    rankName
  }
}
```

### 4. DevTools
- Network tab – Show API requests (login, refresh matches)
- Sources – Show breakpoints if desired
- Console – Any logs

### 5. Brief UI Demo
- Register, login, link Riot ID, refresh matches (keep short)
