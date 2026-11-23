# Bunker*cha

Doʻstlar bilan oʻynaladigan "Bunker" partiya oʻyinining veb-versiyasi. Mobil uchun moʻljallangan PWA; kompyuter va planshetda telefon oʻlchamidagi ramka ichida ochiladi.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind v4 · Convex (backend, realtime) · Clerk (akkaunt).

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the Clerk keys.
3. In Clerk: **Configure → JWT templates → New → Convex** (the template must be named `convex`). Copy its *Issuer* URL.
4. Run `npx convex dev`. It creates/links the deployment, writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to `.env.local`, regenerates `convex/_generated` and pushes the schema + functions. Keep it running.
5. In the Convex dashboard (**Settings → Environment variables**) set `CLERK_FRONTEND_API_URL` to the Issuer URL from step 3.
6. In another terminal: `npm run dev` and open http://localhost:3000.

## Structure

- `convex/schema.ts` – tables: `users` (stats), `rooms`, `players` (cards), `votes`, `games`, `gameResults`.
- `convex/rooms.ts` – lobby: create/join/leave, ready, scenario, kick, start.
- `convex/game.ts` – game loop: intro → reveal → discussion → voting → result → next round / finished. Finishing a game saves `games` + `gameResults` and updates each user's stats.
- `convex/users.ts` – profile, rename, game history.
- `convex/lib/content.ts` – scenarios (yadroviy qish, zombi, oʻzga sayyoraliklar, sunʼiy intellekt), card decks, mascot jokes.
- `src/app` – pages: `/` (bosh sahifa), `/xona/[code]` (oʻyin xonasi), `/profil`, `/qoidalar`, `/sign-in`, `/sign-up`.
- `src/components/room/*` – one component per game phase.
- `src/lib/mascot.ts` – mascot name (Boʻq qorin).
- PWA: `src/app/manifest.ts`, `public/sw.js`, `public/offline.html`, `public/icons/*`.

Every page except sign-in/sign-up requires an account; Convex functions also reject unauthenticated calls.

## Notes

- The service worker only registers in production (`npm run build && npm start`) to avoid caching issues in dev.
- Voting is open: everyone sees whose turn it is and who they voted for, so players can argue and change minds until the host closes the vote.
