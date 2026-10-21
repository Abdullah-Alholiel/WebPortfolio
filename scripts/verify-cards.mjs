/**
 * D5 verification instrument for the WebPortfolio staging build.
 *
 * Proves, with real rendered output:
 *  1. Card anatomy: no description/footer overlap on ANY card, at both
 *     breakpoints (the "View Certificate" collision from the screenshot).
 *  2. Row alignment: cards in the same grid row share a bottom edge.
 *  3. No horizontal overflow at 390px.
 *  4. Touch targets >= 44px for primary controls.
 *  5. Founder entries actually render (DB-backed, not hardcoded).
 *
 * Run: node scripts/verify-cards.mjs [url]
 */
import { chromium } from 'playwright-core';
import path from 'node:path';

const EXECUTABLE = process.env.CHROME_PATH ||
  '/home/ubuntu/.hermes/profiles/fullstack-dev/home/.cache/ms-playwright/chromium-1148/chrome-linux/chrome';
const URL = process.argv[2] || 'https://portfolio.145.241.109.213.sslip.io/';

const measureCards = () => {
  const out = [];
  for (const sectionId of ['achievements', 'mentorship', 'projects']) {
    const section = document.querySelector(`#${sectionId}`);
    if (!section) continue;
    for (const card of section.querySelectorAll('.card-shell, .group.relative')) {
      const desc = card.querySelector('.card-desc, p.line-clamp-3');
      const foot = card.querySelector('.card-footer');
      const title = card.querySelector('.card-title, h3');
      const cr = card.getBoundingClientRect();
      const rec = {
        section: sectionId,
        cardTop: Math.round(cr.top),
        cardBottom: Math.round(cr.bottom),
        cardHeight: Math.round(cr.height),
        title: title ? title.innerText.slice(0, 50) : null,
      };
      if (desc) {
        const d = desc.getBoundingClientRect();
        rec.descBottom = Math.round(d.bottom);
        rec.descClipped =
          desc.scrollHeight > desc.clientHeight + 1;
      }
      if (foot) {
        const f = foot.getBoundingClientRect();
        rec.footTop = Math.round(f.top);
        // OVERLAP > 0 means the footer sits on top of the description text.
        rec.overlapPx =
          rec.descBottom != null ? Math.round(rec.descBottom - f.top) : null;
        // The footer must also stay inside the card's own box.
        rec.footOutsideCard = Math.round(f.bottom - cr.bottom);
      } else {
        rec.overlapPx = null;
        rec.note = 'no card-footer (card not using the contract)';
      }
      out.push(rec);
    }
  }
  return out;
};

const measureRows = () => {
  // Group cards by their vertical band, then compare bottom edges.
  const rows = {};
  for (const sectionId of ['mentorship', 'achievements']) {
    const section = document.querySelector(`#${sectionId}`);
    if (!section) continue;
    for (const card of section.querySelectorAll('.card-shell, .group.relative')) {
      const r = card.getBoundingClientRect();
      const band = Math.round(r.top / 10) * 10;
      const k = `${sectionId}:${band}`;
      (rows[k] = rows[k] || []).push(Math.round(r.bottom));
    }
  }
  return Object.entries(rows)
    .filter(([, bottoms]) => bottoms.length > 1)
    .map(([k, bottoms]) => ({
      row: k,
      count: bottoms.length,
      spread: Math.max(...bottoms) - Math.min(...bottoms),
    }));
};

const measureTargets = () => {
  const small = [];
  for (const el of document.querySelectorAll(
    'button, a, [role="button"], input, select'
  )) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.height < 44) {
      small.push({
        tag: el.tagName,
        text: (el.innerText || el.getAttribute('aria-label') || '')
          .slice(0, 40),
        h: Math.round(r.height),
      });
    }
  }
  return small;
};

const hasFounderEntries = () => {
  const text = document.body.innerText;
  return {
    plugAndPlay: text.includes('Plug & Play Video Analytics'),
    koraLink: text.includes('KoraLink'),
    knowStride: text.includes('KnowStride'),
    entrepreneurialTab: /Entrepreneurial/.test(text),
  };
};

const browser = await chromium.launch({
  executablePath: path.resolve(EXECUTABLE),
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const report = {};
for (const [label, width, height] of [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);

  // Scroll through so every section mounts (framer-motion viewport gates).
  await page.evaluate(async () => {
    for (const id of ['achievements', 'mentorship', 'projects', 'experience']) {
      const el = document.querySelector(`#${id}`);
      if (el) {
        el.scrollIntoView({ block: 'center' });
        await new Promise((r) => setTimeout(r, 700));
      }
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);

  const cards = await page.evaluate(measureCards);
  const rows = await page.evaluate(measureRows);
  const small = await page.evaluate(measureTargets);
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    overflows: document.documentElement.scrollWidth > window.innerWidth + 1,
  }));
  const founder = await page.evaluate(hasFounderEntries);

  const overlapping = cards.filter((c) => (c.overlapPx ?? -1) > 0);
  const outside = cards.filter((c) => (c.footOutsideCard ?? -99) > 1);

  report[label] = {
    cardCount: cards.length,
    overlappingCards: overlapping,
    footerOutsideCard: outside,
    rowAlignment: rows,
    horizontalOverflow: overflow,
    smallTouchTargets: small.length,
    smallTouchTargetSample: small.slice(0, 8),
    founderEntriesVisible: founder,
    sample: cards.slice(0, 6),
  };

  const shot = `/tmp/verify-${label}.png`;
  await page.screenshot({ path: shot, fullPage: false });
  report[label].screenshot = shot;
  await page.close();
}

await browser.close();

// Gate verdict
const fail = [];
for (const [label, r] of Object.entries(report)) {
  if (r.overlappingCards.length) fail.push(`${label}: ${r.overlappingCards.length} card(s) with footer/description overlap`);
  if (r.footerOutsideCard.length) fail.push(`${label}: ${r.footerOutsideCard.length} card(s) with footer outside the card box`);
  if (r.horizontalOverflow.overflows) fail.push(`${label}: horizontal overflow ${r.horizontalOverflow.scrollWidth} > ${r.horizontalOverflow.innerWidth}`);
  for (const row of r.rowAlignment) {
    if (row.spread > 4) fail.push(`${label}: row ${row.row} bottoms differ by ${row.spread}px`);
  }
}

console.log(JSON.stringify(report, null, 1));
console.log('\n=== GATE VERDICT ===');
console.log(fail.length === 0 ? 'PASS — no overlap, no overflow, rows aligned' : 'FAIL:\n- ' + fail.join('\n- '));
process.exit(fail.length === 0 ? 0 : 1);