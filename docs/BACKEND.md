# ValoPoints Backend Architecture

This document explains how the backend of ValoPoints is built and how it works.

---

## Overview

The backend is built with **Next.js 14 App Router** using **Route Handlers** (API routes). There is no separate backend server—everything runs in the same Next.js process. The stack includes:

- **Next.js API Routes** – REST-style endpoints under `/api/*`
- **NextAuth** – Authentication (Credentials + Google OAuth)
- **Prisma** – ORM for SQLite (or PostgreSQL)
- **External APIs** – Henrik Valorant API for match data

---

## 1. API Route Structure

Next.js App Router uses the **file-system based routing**. Any `route.ts` file inside `src/app/api/` becomes an API endpoint:

```
src/app/api/
├── auth/
│   ├── [...nextauth]/route.ts   → /api/auth/* (NextAuth catch-all)
│   ├── register/route.ts        → POST /api/auth/register
│   ├── forgot-password/route.ts → POST /api/auth/forgot-password
│   └── reset-password/route.ts → POST /api/auth/reset-password
├── dashboard/
│   ├── link/route.ts            → POST /api/dashboard/link
│   └── refresh/route.ts         → POST /api/dashboard/refresh
└── admin/
    └── remove-player/route.ts   → POST /api/admin/remove-player
```

Each route file exports HTTP method handlers: `GET`, `POST`, `PUT`, `DELETE`, etc.

---

## 2. How a Route Handler Works

Example: `src/app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();           // Parse JSON body
  // ... validate, process ...
  return NextResponse.json({ ok: true });  // Return JSON response
}
```

- **`NextRequest`** – Incoming request (body, headers, etc.)
- **`NextResponse`** – Helper to build responses (JSON, status codes)
- Export `POST`, `GET`, etc. for each HTTP method you support

---

## 3. Authentication Layer

### NextAuth (`src/lib/auth.ts`)

- **Strategy**: JWT (stateless, no server-side session store)
- **Providers**:
  - **Credentials** – Email + password, verified against `User` table with bcrypt
  - **Google OAuth** – Creates/finds user by email, stores `userId` in JWT

**Flow:**
1. User logs in → NextAuth runs `authorize` (Credentials) or OAuth callback
2. `jwt` callback stores `userId` in the token
3. `session` callback adds `userId` to the session object
4. Session is stored in an HTTP-only cookie (encrypted JWT)

### Session Helper (`src/lib/session.ts`)

- `getSession()` – Uses `getServerSession(authOptions)` to read the JWT
- Validates that the user exists in the database (handles stale sessions)
- Returns `{ userId, username, isLoggedIn, isAdmin }`
- Used in API routes and server components to check auth

### Protecting API Routes

```typescript
const session = await getSession();
if (!session.isLoggedIn || !session.userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## 4. Database Layer (Prisma)

### Schema (`prisma/schema.prisma`)

- **User** – Accounts (username, email, passwordHash)
- **UserProfile** – Linked Riot account (riotName, riotTag, puuid, region)
- **MatchRecord** – Individual ranked matches (kills, deaths, points, etc.)
- **PasswordResetCode** – 6-digit codes for forgot password
- **PuuidFirstLinked** – Tracks when a PUUID was first linked (for points calculation)

### Usage in Routes

```typescript
import { prisma } from '@/lib/prisma';

await prisma.user.create({ data: { ... } });
await prisma.userProfile.findUnique({ where: { userId } });
await prisma.matchRecord.findMany({ where: { ... } });
```

Prisma generates a type-safe client from the schema. Queries are written in JavaScript/TypeScript, not raw SQL.

---

## 5. External API Integration

### Henrik Valorant API (`src/services/valorantApi.ts`)

Uses **axios** to call `https://api.henrikdev.xyz`:

- **`getAccount(name, tag)`** – Resolves Riot ID to PUUID and region
- **`getMmr(...)`** – Fetches current Valorant rank
- **`getMatchHistory(puuid, region)`** – Fetches recent matches
- **`calculateMatchRecord(match, puuid, userId)`** – Converts API match data into our `MatchRecord` shape (kills, deaths, points, etc.)

API key is passed via `HENRIK_API_KEY` in `.env`.

---

## 6. Business Logic (Services)

### Points Calculator (`src/services/pointsCalculator.ts`)

- **`applyMonthlyDeduction(records)`** – Applies 0.7× decay per inactive month
- **`getRank(points)`** – Maps points to belt rank (White → 10th Dan)
- **`getAllRanks()`** – Returns full rank table for prizes page

### Email (`src/lib/email.ts`)

- **`sendPasswordResetCode(to, code)`** – Sends 6-digit code via Nodemailer (SMTP)
- Falls back to `console.log` when SMTP is not configured

---

## 7. API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/register` | POST | No | Create user account |
| `/api/auth/forgot-password` | POST | No | Send reset code to email |
| `/api/auth/reset-password` | POST | No | Verify code, update password |
| `/api/auth/[...nextauth]` | * | NextAuth | Login, logout, OAuth callbacks |
| `/api/dashboard/link` | POST | Yes | Link Riot account |
| `/api/dashboard/refresh` | POST | Yes | Fetch new matches from Henrik API |
| `/api/admin/remove-player` | POST | Admin | Delete user and all data |

---

## 8. Request/Response Pattern

Typical flow:

1. **Parse body**: `const { ... } = await req.json()`
2. **Validate**: Check required fields, format
3. **Auth check**: `getSession()` for protected routes
4. **Business logic**: Call Prisma, external APIs, services
5. **Response**: `NextResponse.json({ ... }, { status: 200|400|401|500 })`

Error handling: Return appropriate status codes (400 validation, 401 unauthorized, 500 server error) with `{ error: "message" }` in the body.

---

## 9. Client-Side Integration

Frontend calls APIs with `fetch`:

```typescript
const res = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, email, password }),
});
const data = await res.json();
```

`fetchWithAuth` (`src/lib/api.ts`) wraps `fetch` and redirects to `/login` on 401.

---

## 10. No Separate Backend

There is no Express, Fastify, or standalone Node server. All backend logic lives in:

- **Route Handlers** (`src/app/api/**/route.ts`)
- **Libraries** (`src/lib/*`)
- **Services** (`src/services/*`)

Next.js compiles and runs these in the same process as the frontend. In production, you deploy a single Next.js app.
