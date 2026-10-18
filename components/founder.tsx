// founder.tsx — Founded products showcase (collapsible, default closed)
import React, { useState } from "react";
import SectionHeading from "./section-heading";
import { useSectionInView } from "@/lib/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaArrowRight, FaLightbulb } from "react-icons/fa";
import {
  venturesData,
  venturesCta,
  type VentureStage,
  type VentureStatus,
  type VentureChip,
} from "@/lib/data";

const STAGE_STYLES: Record<VentureStage, string> = {
  revenue: "bg-emerald-600 text-white",
  "vc-targeted": "bg-violet-600 text-white",
  hobby: "bg-amber-500 text-white",
};

/** Subtle tonal outline chips — quiet companions to the solid stage badge. */
const CHIP_STYLES: Record<VentureChip["tone"], string> = {
  slate:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/15 dark:bg-white/10 dark:text-white/75",
  violet:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300",
  emerald:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300",
};

const STATUS_META: Record<
  VentureStatus,
  { dot: string; pulse?: boolean; label: string; title: string }
> = {
  "in-development": {
    dot: "bg-indigo-500",
    pulse: true,
    label: "In development",
    title: "Actively being developed",
  },
  "coming-soon": {
    dot: "bg-blue-500",
    label: "Coming soon",
    title: "Launching soon",
  },
  archived: {
    dot: "bg-gray-400 dark:bg-white/40",
    label: "Archived · still running",
    title: "Archived but still running",
  },
};

function StatusDot({ status }: { status: VentureStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-white/60"
      title={meta.title}
    >
      <span className="relative flex h-2 w-2">
        {meta.pulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:animate-none ${meta.dot}`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${meta.dot}`} />
      </span>
      {meta.label}
    </span>
  );
}

function VentureCard({
  venture,
  index,
}: {
  venture: (typeof venturesData)[number];
  index: number;
}) {
  const stageStyle = STAGE_STYLES[venture.stage];

  return (
    <motion.article
      className="group relative flex h-full flex-col rounded-xl border border-black/5 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg dark:border-white/10 dark:bg-white/10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
    >
      {/* Stage + status row */}
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${stageStyle}`}
        >
          {venture.stageLabel}
        </span>
        <StatusDot status={venture.status} />
      </div>

      {/* Name */}
      <h3 className="mt-4 text-xl font-semibold leading-snug text-gray-900 dark:text-white">
        {venture.name}
      </h3>

      {/* Optional chips */}
      {venture.chips.length > 0 && (
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {venture.chips.map((chip) => (
            <li
              key={chip.label}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${CHIP_STYLES[chip.tone]}`}
            >
              {chip.label}
            </li>
          ))}
        </ul>
      )}

      {/* Description */}
      <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-700 dark:text-white/70">
        {venture.description}
      </p>

      {/* Link to the project card */}
      {venture.projectLink && (
        <a
          href={venture.projectLink.hash}
          className="mt-4 inline-flex min-h-[36px] w-fit items-center gap-2 rounded-full border border-black/10 px-3.5 py-1.5 text-xs font-semibold text-gray-800 transition-colors hover:border-black/40 dark:border-white/20 dark:text-white/90 dark:hover:border-white/50"
        >
          {venture.projectLink.label}
          <FaArrowRight className="text-[9px] transition-transform group-hover:translate-x-0.5" aria-hidden />
        </a>
      )}
    </motion.article>
  );
}

function InviteCard() {
  return (
    <motion.article
      className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl bg-gray-900 p-6 text-white shadow-sm dark:bg-white/10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
    >
      {/* Soft accent glow, matches the page's ambient blobs */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-violet-500/25 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />

      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
          <FaLightbulb className="text-amber-300" aria-hidden />
          Open to new ideas
        </span>
        <h3 className="mt-4 text-xl font-semibold leading-snug">
          {venturesCta.title} Let&apos;s work on it together.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          {venturesCta.text}
        </p>
      </div>

      <a
        href="#contact"
        className="relative mt-5 inline-flex min-h-[44px] w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
      >
        {venturesCta.ctaLabel}
        <FaArrowRight className="text-[10px]" aria-hidden />
      </a>
    </motion.article>
  );
}

export default function Founder() {
  const { ref } = useSectionInView("Founder", 0.2);
  const [open, setOpen] = useState(false);
  const cardCount = venturesData.length + 1; // + invite card keeps the grid even

  return (
    <section id="founder" ref={ref} className="scroll-mt-28 mb-28">
      <SectionHeading>Founder</SectionHeading>

      {/* Collapsed summary line: everything visible without opening */}
      <div className="mx-auto -mt-5 max-w-[53rem]">
        <p className="text-center text-base text-gray-700 dark:text-white/70">
          Alongside my professional work I have founded seven products, from a
          revenue-generating video analytics tool to VC-targeted platforms now
          in development.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-white/60">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            1 revenue generated
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-600" />
            4 VC targeted
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            2 hobby projects
          </span>
        </div>
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="founder-grid"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-all hover:border-black/25 hover:shadow dark:border-white/15 dark:bg-white/10 dark:text-white/90 dark:hover:border-white/40"
          >
            {open ? (
              <FaChevronDown className="text-xs rotate-180 transition-transform" aria-hidden />
            ) : (
              <FaChevronDown className="text-xs opacity-60" aria-hidden />
            )}
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
              {venturesData.map((venture, index) => (
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
                      '#experience button[aria-pressed="true"][data-mode="entrepreneurial"], #experience button:nth-child(2)'
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
