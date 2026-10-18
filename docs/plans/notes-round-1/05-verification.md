# D5 — Design Verification (notes round 1, staging deploy 2026-10-18)

Target: https://portfolio.145.241.109.213.sslip.io (container `portfolio-staging`, image `portfolio-staging` @ commit 592aba8)
Method: playwright-core + chromium 1148, real page over public HTTPS.

## Results — 14/14 PASS

| Check | Result |
|---|---|
| Projects heading renamed to "Projects" | ✓ |
| 8 project cards render in 2-col grid (1440px) | ✓ |
| Tag clamp: 4 visible + "+N" expander, expands 4→13 | ✓ |
| Expander `aria-expanded` toggles | ✓ |
| Skills: 4 categories get "Show all" toggle | ✓ |
| Skills expand 47→70 chips on click | ✓ |
| "Show all" touch target 44px | ✓ |
| Achievement footers render on all visible cards | ✓ |
| Journey toggle present (Professional \| Entrepreneurial) | ✓ |
| Professional=4 entries → Entrepreneurial=2 entries | ✓ |
| Heading switches to "Entrepreneurial Journey" | ✓ |
| Mentorship last-row bottom alignment Δ=0.0px (≤2 allowed) | ✓ |
| Mobile 390px: no horizontal scroll (scrollWidth 390) | ✓ |
| Public HTTPS 200 through Traefik (fresh image) | ✓ |

Note: one earlier FAIL (412px scrollWidth) was a container-swap race in the
first run; standalone re-check confirmed `overflow-x: clip` applied and
`window.scrollTo(60,0)` does not scroll (scrollX stays 0).

## Evidence
- /tmp/d5-desktop-full.png (full page 1440)
- /tmp/d5-mobile-full.png (full page 390)
- /tmp/d5-journey.png (entrepreneurial mode)
- /tmp/d5-skills.png (skills section)

## Slop/anti-pattern audit
- No invented content: founded-products section NOT added (awaits real data); stage badge taxonomy shipped as inert styles only.
- Token discipline: reused existing Tailwind scale + theme context; no new raw hex beyond existing gradient conventions.
- States: tag expander (collapsed/expanded), skills toggle (collapsed/expanded), journey toggle (two modes + empty state), achievements footer (cert / no-cert). Loading states preserved from before.
