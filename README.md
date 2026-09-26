# Saqlain Riaz — Portfolio v2 ("a portfolio you play")

Dark, 3D, game-flavoured portfolio. Visitors earn XP, level up and unlock achievements while exploring.

**Stack:** Vite · React 19 · TypeScript · React Three Fiber + drei + postprocessing · GSAP + Lenis · Framer Motion · Tailwind v4 · EmailJS · GA4

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
npm run preview
```

Deploys as a static site (Netlify/Vercel). `public/_redirects` is already set up for Netlify.

## Sections (worlds)

| World | Section | What it does |
| --- | --- | --- |
| 0-0 | Boot + Hero | Terminal boot sequence → PRESS START; 3D distorted core with bloom and mouse parallax |
| 1-1 | Skill Galaxy | Six skill domains as planets. Drag to orbit, click to land — skills orbit as moons, dossier shows mastery + "boss defeated" highlight |
| 1-2 | Character Sheet | Holographic tilt card (poke the avatar), animated stat radar, perks |
| 2-1 | Quest Log | Experience as quests with scroll-drawn path; Fiverr reviews as RPG NPC dialogue |
| 2-2 | Inventory | Projects as loot cards by rarity with holo shine; inspect modal with gallery; vault marquee of early builds |
| 3-1 | Arcade | "Mine the Chain" — 3D block stacker mini-game with combos and bounties |
| 4-1 | Final Boss | Contact form — each field damages the boss, sending finishes it (EmailJS) |

## Editing content

Everything lives in **`src/lib/data.ts`**: profile, planets/skills, stats, perks, quests, NPC reviews, projects, archive.
Project screenshots are in `public/projects/<Folder>/1..n.(jpg|png)`. Achievements are in `src/game/achievements.ts`.

## Easter eggs

- Press <kbd>`</kbd> (or the `>_` HUD button) for a terminal — try `help`, `neofetch`, `sudo hire-saqlain`, `matrix`, `coffee`
- Konami code ↑↑↓↓←→←→BA → god mode
- Poke the avatar five times
- Visit after midnight

Progress is saved in `localStorage` (reset from the Achievements panel).
