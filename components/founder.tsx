// founder.tsx — Founded products showcase (collapsible, default closed)
//
// Design contract for the cards (Abdullah, Oct 2026):
//  - every card identical structure and dimensions (h-full, fixed rows)
//  - one restrained label language: small caps text, no colored pills,
//    no pulsing dots, no gradient glows
//  - a single quiet text link, bottom-anchored, only when a target exists
import React, { useState } from "react";
import SectionHeading from "./section-heading";
import { useSectionInView } from "@/lib/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaArrowRight } from "react-icons/fa";
import {
  venturesData,
  venturesCta,
  type VentureStage,
  type VentureStatus,
} from "@/lib/data";
import { usePortfolioData } from "@/context/portfolio-data-context";
import { resolveCopy } from "@/lib/site-copy";

/** Derive the #project-… anchor id the same way project.tsx builds it. */
export function projectAnchorId(title: string): string {
  return `project-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

const STAGE_LABELS: Record<VentureStage, string> = {
  revenue: "Revenue generated",
  "vc-targeted": "VC targeted",
  hobby: "Hobby project",
};

const STATUS_LABELS: Record<VentureStatus, string> = {
  "in-development": "In development",
  "coming-soon": "Coming soon",
  archived: "Archived · still running",
};

function VentureCard({
  venture,
  index,
}: {
  venture: (typeof venturesData)[number];
  index: number;
}) {
  // Resolve the project link against LIVE project titles (regex match).
  const { data } = usePortfolioData();
  const matchedProject = venture.projectLink
    ? (data.projects || []).find((p: { title?: string }) =>
        new RegExp(venture.projectLink!.match, "i").test(p.title || "")
      )
    : null;
  const projectHref = matchedProject
    ? `#${projectAnchorId(matchedProject.title!)}`
    : null;

  return (
    <motion.article
      className="flex h-full flex-col rounded-lg border border-black/[0.08] bg-white p-6 dark:border-white/10 dark:bg-white/[0.06]"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
    >
      {/* Row 1 — one-line meta: stage · status. Plain text, small caps. */}
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-gray-400 dark:text-white/40">
        {STAGE_LABELS[venture.stage]}
        <span className="mx-2 text-gray-300 dark:text-white/25">·</span>
        {STATUS_LABELS[venture.status]}
      </p>

      {/* Row 2 — name, one line, fixed rhythm */}
      <h3 className="mt-3 truncate text-lg font-semibold text-gray-900 dark:text-white">
        {venture.name}
      </h3>

      {/* Row 3 — description, exactly 3 lines everywhere */}
      <p className="mt-2 line-clamp-3 min-h-[3.9rem] text-sm leading-relaxed text-gray-600 dark:text-white/65">
        {venture.description}
      </p>

      {/* Row 4 — single quiet link, bottom-anchored, absent when no target */}
      <div className="mt-auto pt-4">
        {projectHref ? (
          <a
            href={projectHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-black/70 dark:text-white dark:decoration-white/25 dark:hover:decoration-white/70"
          >
            {venture.projectLink!.label}
            <FaArrowRight className="text-[10px]" aria-hidden />
          </a>
        ) : (
          <span
            aria-hidden
            className="inline-flex items-center gap-2 text-sm font-medium text-transparent select-none"
          >
            placeholder
          </span>
        )}
      </div>
    </motion.article>
  );
}

function InviteCard() {
  return (
    <motion.article
      className="flex h-full flex-col rounded-lg border border-black/[0.08] bg-gray-950 p-6 text-white dark:border-white/10 dark:bg-white/[0.06]"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: 0.28, ease: "easeOut" }}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
        Open to new ideas
      </p>

      <h3 className="mt-3 text-lg font-semibold">
        Got an idea? Let&apos;s work on it together.
      </h3>

      <p className="mt-2 line-clamp-3 min-h-[3.9rem] text-sm leading-relaxed text-white/60">
        {venturesCta.text}
      </p>

      <div className="mt-auto pt-4">
        <a
          href="#contact"
          className="inline-flex items-center gap-2 text-sm font-medium text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white/80"
        >
          {venturesCta.ctaLabel}
          <FaArrowRight className="text-[10px]" aria-hidden />
        </a>
      </div>
    </motion.article>
  );
}

export default function Founder() {
  const { ref } = useSectionInView("Founder", 0.2);
  const [open, setOpen] = useState(false);
  // Live ventures from Upstash (admin-editable); static defaults as fallback
  const { data } = usePortfolioData();
  const ventures: (typeof venturesData)[number][] =
    Array.isArray(data.ventures) && data.ventures.length > 0
      ? data.ventures
      : venturesData;

  return (
    <section id="founder" ref={ref} className="scroll-mt-28 mb-28">
      <SectionHeading>{resolveCopy(data.siteCopy, 'founder.title', 'Founder')}</SectionHeading>

      {/* Collapsed summary: the whole section in two lines */}
      <div className="mx-auto -mt-5 max-w-[53rem]">
        <p className="text-center text-base text-gray-700 dark:text-white/70">
          Alongside my professional work I have founded seven products, from a
          revenue-generating video analytics tool to VC-targeted platforms now
          in development.
        </p>
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="founder-grid"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-all hover:border-black/25 hover:shadow dark:border-white/15 dark:bg-white/10 dark:text-white/90 dark:hover:border-white/40"
          >
            <FaChevronDown
              className={`text-xs opacity-60 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden
            />
            {open ? "Hide my products" : "Show my products"}
          </button>
        </div>
      </div>

      {/* Collapsible grid */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="founder-grid"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mx-auto grid max-w-[53rem] grid-cols-1 gap-5 pt-10 sm:grid-cols-2 items-stretch">
              {ventures.map((venture, index) => (
                <VentureCard key={venture.name} venture={venture} index={index} />
              ))}
              <InviteCard />
            </div>

            {/* Bridge to the Entrepreneurial journey */}
            <div className="mt-8 flex justify-center">
              <a
                href="#experience"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-black/30 dark:border-white/15 dark:text-white/80 dark:hover:border-white/40"
                onClick={() => {
                  window.setTimeout(() => {
                    const btn = document.querySelector<HTMLButtonElement>(
                      '#experience button[data-mode="entrepreneurial"]'
                    );
                    btn?.click();
                  }, 700);
                }}
              >
                {venturesCta.journeyLabel}
                <FaArrowRight className="text-[10px]" aria-hidden />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
