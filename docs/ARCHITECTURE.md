# Architecture

## Overview

Connectly's frontend is a full-stack TypeScript web application: a React SPA
served alongside a thin Express server via `vite-express`. The frontend has no
database and no auth system of its own — all data (posts, comments, profiles,
likes, search, activity) and authentication (JWT login/register) come from the
**backend-v2** REST API (Spring Boot, `http://localhost:8082` by default,
configurable via `VITE_API_URL`). The Express server's only remaining
responsibilities are serving the built SPA, security headers, the sitemap, and
a small `/api/key` endpoint used for client-side encryption (see
[AUTHENTICATION.md](./AUTHENTICATION.md)).

## System Diagram

```
Browser
  │
  ├── React SPA (Vite HMR in dev)
  │     ├── Pages (lazy-loaded via React Router)
  │     ├── TanStack Query (data fetching/caching for backend-v2 REST API)
  │     ├── Redux Store (preferences, app, auth slices)
  │     │     └── Persistence Middleware → Encrypted localStorage
  │     ├── Feature Flags (env defaults + runtime overrides via hook)
  │     └── Chakra UI Components
  │
  ├── HTTP requests (same-origin)
  │     ▼
  │   Express Server (vite-express)
  │     ├── API Routes (/api/key) → Returns local-storage encryption key (public)
  │     ├── OpenAPI Contract (docs/openapi.yaml) → Generates shared TS types
  │     ├── Page Routes (/, /login, /register, /feed, ... ) → SPA, served by Vite
  │     └── Static Routes (/sitemap.xml)
  │
  └── HTTP requests (cross-origin, JWT bearer auth)
        ▼
      backend-v2 REST API (Spring Boot, http://localhost:8082)
        ├── /api/auth/{login,register}
        ├── /api/users/me, /api/profile, /api/profile/{userId}
        ├── /api/posts/feed, /api/posts/feed/{id}, .../comments
        ├── /api/search, /api/activity
        └── /media/**
```

## Directory Structure

```
src/
├── generated/                # Machine-generated artifacts (do not hand-edit)
│   └── api/                  # OpenAPI → TypeScript (`npm run gen:api-types`; see skills/api-first/SKILL.md)
│       ├── openapi.generated.ts
│       └── api-types.ts      # Shared client/server API type aliases
│
├── client/                   # Frontend (React SPA)
│   ├── main.tsx              # Entry: providers (Chakra, Redux, I18n, ErrorBoundary)
│   ├── App.tsx               # Route definitions, preferences initialization
│   ├── hooks/                # Custom React hooks
│   ├── locales/              # Language translation files
│   ├── pages/                # Route page components
│   ├── redux/                # Redux slices, store, persistence middleware
│   ├── ui/                   # Reusable UI components
│   └── utilities/            # Client-only utilities (encryption, constants)
│
└── server/                   # Backend (Express)
    ├── main.ts               # Entry: Express app, middleware, routes, vite-express
    ├── config/               # Constants and API error helpers
    ├── controllers/          # Request handlers (e.g. /api/key, sitemap)
    ├── middleware/           # Security headers, global error handler
    └── routes/               # Route definitions
```

## Key Patterns

### Authentication Flow

See [AUTHENTICATION.md](./AUTHENTICATION.md) for full details. Summary:

1. `Login`/`Register` pages call `POST /api/auth/login` / `POST /api/auth/register` on backend-v2.
2. On successful login, the returned JWT plus `GET /api/users/me` are stored in the `auth` Redux slice (`setCredentials`).
3. `apiClient` (`src/client/api/client.ts`) attaches `Authorization: Bearer <token>` to every backend-v2 request via an axios request interceptor.
4. A response interceptor dispatches `logout()` on `401`, clearing the `auth` slice.
5. `ProtectedRoute` (`src/client/ui/components/protected-route.tsx`) redirects to `/login` when `auth.token` is absent.

### State Persistence Flow

1. On app load, `initPreferences` async thunk fetches the local-storage encryption key from `/api/key` (public endpoint).
2. `initAuth` and `initPreferences` use that key to decrypt the persisted `auth` (`{token, user}`) and `preferences` slices from `localStorage`.
3. On every Redux action, the persistence middleware encrypts and saves both slices.
4. The persistence middleware in `store.ts` is reusable — add persistence registrations for slices, don't create new middleware.

### Feature Flag Flow

1. Env defaults are parsed from `VITE_FEATURE_FLAGS`
2. Runtime overrides are stored in `app.featureFlagOverrides`
3. `useFeatureFlag(flagName)` resolves runtime override first, env default second

### UI failure/latency boundaries

- App-level catastrophic failure handling is managed by `ErrorBoundary` in `src/client/main.tsx`.
- Route-level latency is managed by `Suspense` around lazy routes in `src/client/App.tsx`.
- Feature-level failures should use local boundaries when one section can fail independently (example: product counter actions).
- Feature-level latency should use local `Suspense` only for independently-loading sections, not whole-page wrappers.
- Use React 19 `Activity` around loading fallback UI when representing active pending work.

### Client/Server Code Separation

The client uses `src/client/utilities/` for browser-specific helpers. Server helpers live in `src/server/config/` and `src/server/controllers/`. Keep client-only and server-only modules separated to avoid accidental cross-runtime imports.

## Technology Choices

| Layer | Choice | Why |
|---|---|---|
| Build | Vite | Fast HMR, ESM-native, simple config |
| Frontend | React 19 | Document metadata, hooks, Suspense |
| State | Redux Toolkit | DevTools, middleware, battle-tested at scale |
| Data fetching | TanStack Query | Caching, refetching, and mutation state for the backend-v2 REST API |
| Routing | React Router | Lazy loading, client-side navigation |
| UI | Chakra UI | Accessible, composable, good TypeScript support |
| Backend (frontend host) | Express 5 | Serves the built SPA + `/api/key` via `vite-express` |
| API | backend-v2 (Spring Boot REST) | Auth, posts, comments, profiles, search, activity |
| Auth | JWT bearer tokens (issued by backend-v2) | Stateless, works across origins without cookies |
| Encryption | Native Web Crypto API | AES-GCM encryption for localStorage |
| Testing | Playwright + Vitest | E2E testing (Playwright) and unit tests (Vitest) |
| Linting | ESLint | Custom config with TypeScript + React rules |
