# Gate 0 — Retro: notes round 1 (2026-10-18)

Baseline: d4d16c5 (feat/staging-notes). fix:feat ratio last 12: 4 fix/style : 8 feat — healthy.

## Source: 8 staging notes (Abdullah, 2026-10-18 11:20–11:24Z)

| # | Section | Note (condensed) |
|---|---------|------------------|
| 1 | projects | Compact cards, subtle tailored design, "show more" on rest of tags |
| 2 | experience | Two toggle modes under "Journey" heading: Professional / Entrepreneurial. Research best pattern |
| 3 | mentorship | BA card not aligned with the end of the two cards on its right — fix structure |
| 4 | achievements | "View Certificate" text too close to end of box |
| 5 | achievements | Azure card = the good example ("like this example") |
| 6 | achievements | Some cards have no pic / no View Certificate → odd design |
| 7 | skills | Show only 2 rows + central "Show all" tailored button, per sub-section |
| 8 | projects | Rename "My Projects" → "Projects". NEW section BEFORE it: founded products with stage tags (hobby / exited / VC-targeted). Research card designs |

## Connectivity audit findings

- Achievements footer "View Certificate" is UNCONDITIONAL (achievements.tsx L86–95) — renders even when `certificateUrl` missing (live Upstash data can lack certs even though static fallback has all 6). Root cause of note 6. Fix: conditional render + graceful no-cert layout.
- Skills data bug: `lib/data.ts` L171 sparse array (`, ,`) + typos `FatsAPI`, `Assitants` (objective fixes).
- Projects are full-width alternating cards (max-w-[42rem]) — note 1 wants compact. Compact grid pattern (researched): 2–3 col responsive grid, uniform card height, tag clamp with "+N" expander — standard portfolio pattern (keeps scanability, exposes more projects per viewport).
- Experience mode split is derivable from EXISTING data (no invention): Professional = EndUp, CLO, Novintiq, AI Feedback Evaluator (employed/professional engagements). Entrepreneurial = Freelance E-commerce Specialist (self-employed venture), Event Organizer (founded/profit events).
- Founded-products section (note 8): DEFERRED — Abdullah must supply the real product entries (name, stage tag, description, links). Nothing in data.ts defines founded products; inventing them violates the honest-copy rule. Heading rename to "Projects" ships now; the new section scaffolds only after he provides content (or approves sample structure with placeholders).
- Deep-link safety: project→experience links rely on element ids; default mode = Professional. Entrepreneurial items hidden in Professional mode → deep links to them fall back to section scroll (documented edge).

## Canonical verification

`npx next build` (staging flag on) + container redeploy + real-browser D5 via playwright (390px + 1440px, screenshots, DOM measurements).

## Decisions (autonomous mode)

- Rename ships: "My projects" → "Projects" (his exact wording: either "Involved projects" or "projects").
- Founded-products: placeholder-free — NOT shipped without his data. Plan entry created.
- Stage-tag taxonomy designed now (Hobby / Exited / VC-targeted badge styles) so the section lands fast when content arrives.
