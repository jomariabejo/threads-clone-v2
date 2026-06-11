# Authentication

Connectly's frontend has no auth system of its own. All authentication is delegated
to the **backend-v2** REST API (Spring Boot, `http://localhost:8082` by default,
configurable via `VITE_API_URL`). The frontend's job is limited to:

- collecting credentials and forwarding them to backend-v2
- storing the JWT it gets back
- attaching that JWT to subsequent API requests
- redirecting unauthenticated users away from protected pages

There is no `httpOnly` cookie, no Passport.js, no local starter account, and no
`AUTH_PROFILE` switch — those belonged to the previous local Express auth
subsystem and have been removed.

## Login flow

1. The user submits the form on `src/client/pages/Login.tsx`.
2. `login()` (`src/client/api/auth.ts`) calls `POST /api/auth/login` with
   `{ username, password }` and gets back `{ token }` — a JWT signed by
   backend-v2 (`JWT_SECRET` env var on the `backend_v2` service).
3. The page immediately calls `GET /api/users/me` with that token to fetch the
   current user.
4. On success, `{ token, user }` is dispatched via `setCredentials`
   (`src/client/redux/auth.ts`) into the `auth` Redux slice, and the user is
   navigated to `/feed`.
5. On failure (`401`), an inline error message is shown; no token is stored.

## Register flow

`src/client/pages/Register.tsx` posts `{ name, email, username, password }` to
`POST /api/auth/register` (`register()` in `src/client/api/auth.ts`). On
success the user is redirected to `/login` with a "registration successful"
message. There is no auto-login after registration — the user logs in
explicitly afterwards.

## Attaching the token to requests

`src/client/api/client.ts` creates a shared axios instance (`apiClient`):

- A request interceptor reads `auth.token` from the Redux store and sets the
  `Authorization: Bearer <token>` header on every outgoing request.
- A response interceptor watches for `401` responses and dispatches
  `logout()`, clearing `token`/`user` from the `auth` slice. The next render
  of `ProtectedRoute` then redirects to `/login`.

Backend-v2 verifies the JWT itself; the frontend never decodes or validates
the token — it's an opaque bearer credential.

## Route protection

`src/client/ui/components/protected-route.tsx` wraps all authenticated routes
in `App.tsx`. It reads `auth.token` from Redux; if absent, it renders
`<Navigate to={ROUTES.LOGIN} replace />` instead of the protected page's
`<Outlet />`.

## Persisting the session across reloads

The frontend still uses the encrypted-`localStorage` persistence pattern from
the original boilerplate (`src/client/utilities/encryption.ts`,
`src/client/utilities/persistence.ts`):

1. On app startup, `initPreferences` fetches the local-storage encryption key
   from `GET /api/key`. This endpoint is **public** — it has no relationship
   to backend-v2 auth and is unrelated to the user's login state.
2. `initAuth` (`src/client/redux/auth-actions.ts`) then uses that key to
   decrypt the persisted `{ token, user }` pair from `localStorage` (stored
   under the `Connectly.auth` key) and restores it into the `auth` slice.
3. On every Redux action, the persistence middleware (`store.ts`)
   re-encrypts and saves the current `auth` slice (alongside `preferences`).
4. Logging out (`logout()`) resets the slice to `{ token: null, user: null }`,
   which is then persisted as the new (empty) encrypted state.

## CORS

Because the frontend (`http://localhost:3000` in dev, `http://localhost:3001`
via docker-compose) and backend-v2 (`http://localhost:8082`) are different
origins, backend-v2 must allow cross-origin requests with the `Authorization`
header. This is configured via `CORS_ALLOWED_ORIGINS` on the `backend_v2`
service in `docker-compose.yml`. No cookies are used, so
`Access-Control-Allow-Credentials` is not required.

## Deferred

- **Google OAuth** — not yet supported by backend-v2; only username/password
  login and registration are available.
- **Token refresh / WebSocket session invalidation** — backend-v2 issues a
  single long-lived JWT today; refresh tokens and real-time session
  invalidation are deferred to a later backend phase.
