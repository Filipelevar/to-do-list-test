# Task Manager

A small task manager built with **Next.js 15 (App Router)**, **TypeScript** and **tRPC**.
You can list, create, edit and delete tasks. The task list is **server-side rendered**,
and the app uses an **in-memory** store (there is no database).

## Features

- Task list rendered on the server (SSR), then hydrated into React Query
- Create, edit and delete tasks with validation on both client and server
- One form component shared by the create and edit pages
- Infinite scroll with cursor-based pagination, plus a "Load more" fallback button
- Loading, empty and error states, with a retry button
- Delete confirmation dialog and toast feedback
- Responsive layout and basic accessibility (labels, `aria-*`, keyboard focus, native `<dialog>`)

## Tech stack

| Technology              | Used for                                        |
| ----------------------- | ----------------------------------------------- |
| Next.js 15 (App Router) | Routing, Server Components, SSR                 |
| TypeScript              | End-to-end types                                |
| tRPC v11                | Type-safe API between server and client         |
| Zod                     | Input validation, schemas shared by both sides  |
| TanStack React Query    | Client cache, mutations, infinite queries       |
| React Hook Form         | Form state, with the same Zod schema as the API |
| Tailwind CSS v4         | Styling                                         |
| Sonner / Lucide React   | Toasts / icons                                  |
| superjson               | Keeps `Date` objects intact over the wire       |

## Getting started

Requirements: **Node.js 20+** and **Yarn** (the version is pinned in `package.json` via Corepack).

```bash
corepack enable
yarn install
yarn dev
```

Open <http://localhost:3000>.

### Scripts

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `yarn dev`       | Start the development server  |
| `yarn build`     | Create a production build     |
| `yarn start`     | Run the production build      |
| `yarn lint`      | Run ESLint                    |
| `yarn typecheck` | Run the TypeScript compiler   |
| `yarn format`    | Format the code with Prettier |

## Architecture

```
Browser
  └─ Next.js page (Server Component)  ── prefetches the first page of tasks
       └─ HydrationBoundary           ── sends the data to the client cache
            └─ TaskDashboard (Client) ── React Query takes over (mutations, pagination)
                 └─ tRPC client  ──HTTP──▶  /api/trpc  ──▶  taskRouter
                                                              └─ Zod validation
                                                                   └─ TaskService (business rules)
                                                                        └─ TaskRepository (in-memory)
```

Each layer has one job:

- **Router** (`src/server/api/routers/task.ts`): validates input with Zod and delegates. No business logic.
- **Service** (`src/server/services/task.service.ts`): business rules such as sorting,
  pagination, normalizing an empty description and throwing `TaskNotFoundError`.
- **Repository** (`src/server/repositories/task.repository.ts`): storage behind a `TaskRepository`
  interface. Swapping the in-memory version for a database means writing a new
  implementation; the service, routers and frontend stay the same.
- **tRPC middleware** (`src/server/api/trpc.ts`): turns domain errors into tRPC errors
  (`TaskNotFoundError` → `NOT_FOUND`), so the service knows nothing about HTTP.

### Project structure

```
src/
├── app/
│   ├── page.tsx                  # Task list (SSR + hydration)
│   ├── tasks/new/page.tsx        # Create task
│   ├── tasks/[id]/edit/page.tsx  # Edit task (loaded on the server)
│   ├── api/trpc/[trpc]/route.ts  # tRPC HTTP endpoint
│   ├── loading.tsx · error.tsx · not-found.tsx
│   └── layout.tsx
├── components/
│   ├── tasks/                    # TaskDashboard, TaskCard, TaskForm, DeleteTaskDialog…
│   └── ui/                       # Button, FormattedDate
├── lib/
│   ├── validations/task.schema.ts  # Zod schemas shared by client and server
│   ├── task-queries.ts             # Query input shared by the server prefetch and the client
│   └── utils.ts
├── server/
│   ├── api/                      # tRPC init, root router, task router
│   ├── services/task.service.ts
│   └── repositories/task.repository.ts
├── trpc/
│   ├── client.tsx                # tRPC + React Query provider for the browser
│   ├── server.tsx                # Server-side tRPC proxy, caller and HydrateClient
│   └── query-client.ts
└── types/task.ts
```

### API (tRPC procedures)

| Procedure     | Type     | Input                                    | Description                      |
| ------------- | -------- | ---------------------------------------- | -------------------------------- |
| `task.list`   | query    | `{ limit?: number, cursor?: string }`    | Paginated list, newest first     |
| `task.byId`   | query    | `{ id: string }`                         | One task (used by the edit page) |
| `task.create` | mutation | `{ titulo: string, descricao?: string }` | Creates a task                   |
| `task.update` | mutation | `{ id, titulo, descricao? }`             | Updates a task                   |
| `task.delete` | mutation | `{ id: string }`                         | Deletes a task                   |

Task model, as defined by the challenge:

```ts
type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
};
```

Validation rules: `titulo` is required, trimmed, 1–120 characters; `descricao` is optional,
up to 1000 characters (an empty string clears it). Unknown ids return `NOT_FOUND`.

## Technical decisions

### SSR for the task list

The home page is a Server Component. It runs the `task.list` procedure **directly on the
server** (through `createTRPCOptionsProxy`, with no HTTP round trip) and waits for the result
before rendering. The data is then dehydrated into the HTML and hydrated into React Query on the
client. So the first HTML response already contains the tasks; you can check this with
`curl http://localhost:3000`. The list does not depend on a `useEffect` fetch after mount.

The page uses `dynamic = "force-dynamic"` because the data changes at runtime and must not be
frozen at build time.

### Cache updates after mutations

- **Create / update:** invalidate the list, prime the `byId` cache, then redirect to the list.
- **Delete:** remove the task from the cached pages right away, show a toast, then invalidate
  the list to resync with the server.

Invalidation keeps things simple and correct. Fully optimistic updates were left out because
they add complexity this app does not need.

### Cursor pagination

The cursor is the creation time plus the id of the last task on a page. Unlike an offset, it
does not skip or repeat items when tasks are created or deleted between page loads.

### Dates and time zones

The server and the browser may be in different time zones. `FormattedDate` renders a neutral
UTC date during SSR and switches to the local, friendly label ("Today at 14:30") after
hydration. This avoids hydration mismatches.

### What was intentionally left out

Redux (React Query already manages server state), Prisma or a database (not required),
authentication, Docker and a full UI library. They would add weight without serving a
requirement.

## Limitations of the in-memory store

The challenge asks for in-memory storage. That is fine for a local demo, but:

- **Data is lost when the server process restarts** (including `yarn dev` restarts and new deploys).
- **Data is not shared between instances.** With horizontal scaling, each instance has its own list.
- **Serverless platforms** (for example Vercel) give no guarantee that two requests hit the
  same instance, so tasks may appear and disappear between requests.

The repository is stored on `globalThis` so hot reloading in development does not wipe it.
For production, the next step would be a database-backed `TaskRepository` (for example
PostgreSQL with Prisma or Drizzle); nothing outside the repository would need to change.

## AI Assistance Disclosure

AI was used as a supporting tool during the initial project planning, helping me organize the folder structure, outline the initial code architecture, and improve the README's clarity and organization.

The implementation, technical decisions, and adjustments were made by me, Filipe Levar, throughout the development process. I reviewed the suggestions, adapted what made sense, and made the final decisions regarding the code and architecture.
