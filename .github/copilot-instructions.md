# Front Customer Feedback — Copilot Instructions

## Stack

- **React 19 + Vite + TypeScript** — strict mode toggle via `STRICT_MODE` const in `main.tsx`
- **Tailwind CSS v4** — use `bg-linear-to-br` (NOT `bg-gradient-to-br`), `text-[11px]` for fine sizes
- **React Router v6** — `useNavigate`, `useParams`, `useLocation`
- **No state management library** — use `useState` / `useMemo` / `useCallback` only

## Project Structure

```
src/
  api/
    feedbackService.ts  # Domain types + UI mappings + feedback CRUD API
    auth.ts             # Auth types (AuthData) + localStorage helpers
    client.ts           # buildApiUrl / buildHeaders (shared HTTP utils)
    uploadService.ts    # AttachmentPayload type + file upload functions
  components/ui/  # Shared UI primitives (Card, NavBar, LocaleSwitcher…)
  constants/      # env.ts (env vars), routes.ts (all API path constants)
  i18n/           # I18nProvider, useI18n, messages
  pages/          # Page components, co-located sub-components in components/
  utils/          # Pure utility functions (date.ts: formatUpdatedAt, formatTime)
```

## Code Conventions

### API & Types

- **All API functions and shared types live in `src/api/feedbackService.ts`** — never define duplicates in pages
- **All UI display mappings live there too**: `FEEDBACK_TYPE_LABEL`, `statusChip()` — import from service, never redefine locally
- All API paths are constants in `src/constants/routes.ts` — never hardcode paths inline
- Auth token stored in `localStorage` under key `fb_auth` as `{ token, expiresAt, identity }` — always use `getAuthData()` / `getSessionToken()` helpers
- On 401 → always `clearSessionToken()` then `navigate('/')`

### Components & Pages

- **One concern per file** — if a helper function is reused across pages, extract to `src/utils/` or `src/api/`
- Date formatting → `formatUpdatedAt()` from `src/utils/date.ts`
- Avoid inline magic strings for status/type labels — use `FEEDBACK_TYPE_LABEL` and `statusChip()`
- Use `cancelled` flag pattern in `useEffect` to prevent state updates after unmount:
  ```ts
  useEffect(() => {
    let cancelled = false
    fetchSomething().then(data => {
      if (!cancelled) setState(data)
    })
    return () => {
      cancelled = true
    }
  }, [dep])
  ```

### Styling

- Tailwind v4 gradient: `bg-linear-to-br` (not `bg-gradient-to-br`)
- Card style: `rounded-2xl border bg-white p-4 shadow-sm`
- Status badges: always use `statusChip(status)` which returns `{ label, className }`
- Customer messages: `border-slate-100`, admin messages: `border-indigo-100`

### Forms & Async

- Always show loading / error / empty states explicitly
- Use `disabled` on submit buttons while `submitting` is true
- Upload progress via `uploadFiles()` callback — show a progress bar only when `0 < progress < 100`
- `⌘ + Enter` shortcut for textarea submit via `onKeyDown`

## Proxy & CORS

- Local dev: Vite proxy in `vite.config.ts` → `/api` → `http://localhost:8080`
- Production: Vercel rewrites in `vercel.json` → `/api/:path*` → `https://api-feedback.johnyxu.com/api/:path*`
- `VITE_API_BASE_URL` must be **empty** in both envs so all requests use relative `/api/...` paths

## Code Quality & File Organization

### Component Decomposition

- **300-line rule**: If a file exceeds 300 lines, split it — extract sub-components into `components/` next to the page, extract hooks into `use*.ts`, extract pure logic into `utils/`
- **One responsibility per component**: A component that fetches data AND renders a complex UI AND handles form submission should be split
- Prefer named exports for all components and utilities (easier to refactor/search)
- Co-locate sub-components with their parent page under `pages/<feature>/components/` before promoting to `components/ui/`

### Reusability

- Before writing a new UI block, check `src/components/ui/` — prefer extending existing primitives
- Extract any logic used in 2+ places to `src/utils/` or `src/api/` immediately — never duplicate
- Custom hooks (`use*.ts`) for stateful logic shared across components

### Readability

- Keep JSX render blocks under ~50 lines — extract named sub-components (`<MessageCard />`, `<FollowUpBox />`) rather than nesting deeply
- Group related state declarations together; group related handlers together
- Avoid anonymous inline arrow functions in JSX for anything more than trivial `() => navigate(...)` calls

## What NOT to Do

- Do not add `StrictMode` back without flipping `STRICT_MODE = true` in `main.tsx`
- Do not define `TYPE_LABEL` or `statusBadge/statusChip` locally in page files
- Do not hardcode API URLs — use constants from `routes.ts`
- Do not store token as plain string — always use the `AuthData` shape
- Do not use `bg-gradient-to-br` (Tailwind v4 renamed it)
