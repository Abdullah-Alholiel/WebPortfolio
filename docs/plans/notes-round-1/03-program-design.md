# Gate 3 — Program contracts (notes round 1)

All changes are RENDER-ONLY (client components + static data). No API/DB schema changes. Staging note data stays in `.staging/notes.json`.

## Data contracts (extended, backward-compatible)

```ts
// ProjectProps + new optional stage tag (founded products, future section)
type ProjectStage = "hobby" | "exited" | "vc-targeted";
// stage?: ProjectStage        → renders stage badge; absent = no badge (existing projects)

// Achievement: certificateUrl is OPTIONAL in live Upstash data
certificateUrl?: string;       // absent → footer renders "Details on request" muted row, no arrow
```

## Component contracts

### projects.tsx
- Heading text: `Projects` (was `My projects`), loading state matches.
- Grid: `grid gap-5 sm:grid-cols-2` inside existing section; card = self-contained, uniform min-height, NO alternating overlap (removed).
- Card (project.tsx): image top (h-40 object-cover, rounded-t), body p-5, title `text-lg font-semibold line-clamp-1`, desc `text-sm line-clamp-3`, tags: first 4 visible + `+N` button; expanded shows all (per-card state, aria-expanded, keyboard accessible). Motion: keep scroll scale/opacity entrance only (reduced-motion safe via framer defaults? → keep, decorative).

### skills.tsx
- Per category: collapsed = first 2 visual rows (measure via height: rows of chips ≈ 2×(chipH+gap); implement as max-height clamp + fade) + centered `Show all` toggle button (aria-expanded, chevron rotate).
- Expanded = full list. Button label: `Show all (N)` / `Show less`. Per-category independent state.

### achievements.tsx (AchievementCard)
- Footer: `certificateUrl ? "View Certificate" row (unchanged style, mt-6→mt-auto pt-4, min gap from body ≥ 16px)` : `muted "Certificate available on request" row (no arrow, no border-t accent change)`.
- Content div gets `min-h-0`; footer uses `mt-auto` + `pt-5` so text never touches card bottom (fixes note 4).
- Azure card = reference; layout unchanged for cards WITH certs (note 5).

### experience.tsx
- Under SectionHeading: segmented toggle `Professional | Entrepreneurial` (role=tablist, aria-selected, keyboard arrows optional; 44px targets).
- Professional = AI Feedback Evaluator, Digital Strategist, Digital Consultant, Junior System Engineer.
- Entrepreneurial = Freelance E-commerce Specialist, Event Organizer.
- Classification via `EXP_MODE` map in component (data-driven, no data.ts change). Default = Professional. Toggle persists in URL hash? NO — state only (deep links unaffected).
- Empty state per mode if none.

## i18n
Site is EN-only; strings inline (matches codebase convention). EN copy only this round.

## Verification (Gate 4 / D5)
`NEXT_PUBLIC_STAGING_NOTES=on npx next build` green → rebuild image → redeploy container → playwright: 390px+1440px screenshots, scrollWidth check, touch targets ≥44px on new controls, tag clamp + show-all works, cert-conditional render, mode toggle switches lists, dark mode spot-check.
