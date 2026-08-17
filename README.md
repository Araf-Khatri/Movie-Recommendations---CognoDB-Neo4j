# MovieGraph — Cinematic Discovery Powered by a Graph Database

A modern movie discovery and recommendation web application built for the **Wexa AI Take-Home Assignment**. MovieGraph demonstrates how a fully-managed graph database can power real-world discovery features — personalized recommendations, relationship-based browsing, and persistent user activity — through Neo4j-compatible Bolt and Cypher.

**Live Demo:** [movie-recommendation-araf-cognodb.netlify.app](https://movie-recommendation-araf-cognodb.netlify.app/)
**Stack:** TanStack Start · React 19 · TypeScript · Tailwind CSS v4 · CognoDB (Neo4j Bolt)

---

## What the project focuses on

MovieGraph solves the classic "what should I watch next?" problem by treating movies, people, genres, and users as a connected graph rather than isolated rows.

- **Graph-native data model:** Movies are nodes. Directors, actors, and genres are also nodes. Relationships like `DIRECTED`, `ACTED_IN`, and `IN_GENRE` connect them.
- **Relationship-driven recommendations:** Suggestions are ranked by shared graph proximity — same director, shared cast, and shared genres — not just popularity.
- **Persistent user activity:** Liking or watching a movie creates `LIKED`/`WATCHED` relationships between a `User` node and a `Movie` node in CognoDB.
- **Polished UX:** Dark-first cinematic UI with loading, empty, and error states; responsive down to mobile.

---

## Core flows

### 1. Browse & search

- Visit `/movies` to browse the full catalog.
- Filter by genre, year, and minimum rating.
- Sort by rating, year, or title.
- Use `/search` for a dedicated search experience with debounced query updates.

### 2. Movie details & related picks

- Click any movie card to open `/movies/:id`.
- View metadata: year, rating, runtime, genres, director, cast, and description.
- See **Movies You May Also Like** ranked by graph traversal weights:
  - Same director: `4×`
  - Shared actor: `3×`
  - Shared genre: `2×`
- A **Explore Movie Graph** CTA links to the Graph Explorer (`/graph`).

### 3. Recommendations

- Visit `/recommendations` to see personalized groups such as:
  - "Because you watched X"
  - "Because you like `<Genre>`"
- Each card shows a **Match Score** and a **Reason** chip explaining why it was suggested.

---

## Login flow

MovieGraph uses a lightweight, email-only authentication flow.

1. **No passwords.** Click **Sign In** in the navbar or visit `/login`.
2. Enter any email address and press **Continue**.
3. The email is stored in the browser's `localStorage` under `moviegraph:state:v1`.
4. The app derives a display name from the email prefix (e.g., `araf@moviegraph.app` → `Araf`).
5. The same email is used as the unique identifier for the `(:User {email: ...})` node in CognoDB.
6. **Sign Up is disabled** — the `/register` route redirects to `/login` so there is only one entry point.
7. **Sign Out** clears the local session and falls back to a guest identity (`guest@moviegraph.app`).

> **Note:** This is intentionally UI-only auth for the MVP. The backend does not validate passwords or issue JWTs; it simply uses the email as a stable user key.

---

## Watched & liked persistence

Every watched/like action communicates with the backend.

| Action          | UI                         | Backend effect                                    |
| --------------- | -------------------------- | ------------------------------------------------- |
| Mark as Watched | Details page / card action | `MERGE (u:User)-[:WATCHED]->(m:Movie)` in CognoDB |
| Like            | Details page / card action | `MERGE (u:User)-[:LIKED]->(m:Movie)` in CognoDB   |
| Toggle off      | Click again                | Deletes the relationship                          |

Flow:

1. User toggles an action.
2. The UI updates optimistically.
3. `toggleActivityFn` (TanStack server function) calls `toggleActivity` in `src/lib/movies/cognodb.server.ts`.
4. The server checks whether the relationship exists, deletes it if present or creates it if absent.
5. The updated activity is returned and stored in React context.

This activity feeds the recommendation engine, so the more movies you interact with, the better the suggestions become.

---

## Architecture

```
src/
├── components/
│   ├── layout/          # Navbar, footer, mobile nav
│   ├── movie/           # MovieCard, MovieGrid, MovieCarousel, actions
│   └── feedback/        # Skeleton, EmptyState, ErrorState
├── lib/
│   ├── movies/
│   │   ├── types.ts          # Domain types
│   │   ├── api.ts            # Client-facing API wrapper
│   │   ├── api.functions.ts  # TanStack server functions
│   │   ├── cognodb.server.ts # CognoDB driver & Cypher queries
│   │   ├── query-utils.ts    # Recommendation scoring logic
│   │   └── data.ts           # Seed movie dataset
│   └── user-state.tsx        # Auth + activity React context
├── routes/
│   ├── index.tsx             # Home
│   ├── movies.index.tsx      # Browse
│   ├── movies.$id.tsx        # Details
│   ├── search.tsx            # Search
│   ├── recommendations.tsx   # Recommendations
│   ├── graph.tsx             # Graph Explorer (placeholder)
│   ├── login.tsx             # Email-only login
│   └── register.tsx          # Disabled; redirects to login
└── styles.css                # Semantic design tokens
```

- **Frontend:** TanStack Start with file-based routing and React Server Functions.
- **Data layer:** All reads/writes go through `createServerFn` handlers.
- **Database:** CognoDB via the official `neo4j-driver`.
- **State:** `UserProvider` manages session and activity; TanStack Query handles server state.

---

## Environment variables

Create a `.env` file in the project root with the following CognoDB credentials:

```env
COGNODB_URI=bolt+s://db-850242a0.databases.cognodb.com
COGNODB_USER=cognodb
COGNODB_PASSWORD=c537f80f72e01996f42374fd2e0fd656
```

> The database password is never committed to the repository; it is read from environment variables at runtime inside server function handlers.

---

## Running locally

```bash
# 1. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Seeding CognoDB

The seed script pushes the curated dataset (~30 movies, directors, actors, genres, and relationships) into your CognoDB instance. Run it whenever you need to reset or repopulate the graph.

---

## Key design decisions

- **Graph-first recommendations:** Instead of pre-computing similarity matrices, recommendations are calculated at request time by traversing `DIRECTED`, `ACTED_IN`, and `IN_GENRE` relationships.
- **Email-as-identity:** Keeps the auth flow minimal while still giving every user a persistent `User` node in the graph.
- **Server functions for DB access:** All CognoDB calls live in `*.functions.ts` and `*.server.ts` files so credentials never reach the browser bundle.
- **Dark cinematic UI:** Semantic color tokens in `src/styles.css` keep the theme consistent and maintainable.

---

## Assignment submission details

- **Repository:** [Movie Recommendations - CognoDB](https://github.com/Araf-Khatri/Movie-Recommendations---CognoDB-Neo4j)
- **Demo:** https://movie-recommendation-araf-cognodb.netlify.app

The CognoDB instance used for this demo will remain running for evaluation.
