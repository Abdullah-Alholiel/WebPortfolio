// ventures.tsx — Founded products showcase
import React from "react";
import SectionHeading from "./section-heading";
import { useSectionInView } from "@/lib/hooks";
import { motion } from "framer-motion";
import {
  FaRocket,
  FaGithub,
  FaRegClock,
  FaRegCheckCircle,
  FaRegDotCircle,
} from "react-icons/fa";
import {
  venturesData,
  venturesCta,
  type VentureStage,
} from "@/lib/data";

const STAGE_STYLES: Record<VentureStage, string> = {
  revenue: "bg-emerald-600 text-white",
  "vc-targeted": "bg-violet-600 text-white",
  hobby: "bg-amber-500 text-white",
};

const STATUS_META = {
  live: { icon: FaRegCheckCircle, label: "Live", title: "Live and running" },
  archived: {
    icon: FaRegDotCircle,
    label: "Archived · running",
    title: "Archived but still running",
  },
  "coming-soon": {
    icon: FaRegClock,
    label: "Coming soon",
    title: "In development",
  },
} as const;

function VentureCard({
  venture,
  index,
}: {
  venture: (typeof venturesData)[number];
  index: number;
}) {
  const stageStyle = STAGE_STYLES[venture.stage];
  const status = STATUS_META[venture.status];
  const StatusIcon = status.icon;

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
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-white/60"
          title={status.title}
        >
          <StatusIcon aria-hidden />
          {status.label}
        </span>
      </div>

      {/* Name */}
      <h3 className="mt-4 text-xl font-semibold leading-snug text-gray-900 dark:text-white">
        {venture.name}
      </h3>

      {/* Optional chips */}
      {venture.chips.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {venture.chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-black/10 bg-black/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-gray-700 dark:border-white/15 dark:bg-white/10 dark:text-white/80"
            >
              {chip}
            </li>
          ))}
        </ul>
      )}

      {/* Description */}
      <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-700 dark:text-white/70">
        {venture.description}
      </p>

      {/* Link */}
      {venture.link && (
        <a
          href={venture.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-black/10 px-3.5 py-1.5 text-xs font-semibold text-gray-800 transition-colors hover:border-black/40 dark:border-white/20 dark:text-white/90 dark:hover:border-white/50"
        >
          <FaGithub aria-hidden />
          View repository
        </a>
      )}
    </motion.article>
  );
}

export default function Ventures() {
  const { ref } = useSectionInView("Ventures", 0.2);

  return (
    <section id="ventures" ref={ref} className="scroll-mt-28 mb-28">
      <SectionHeading>Ventures</SectionHeading>
      <p className="-mt-5 mb-12 text-center text-base text-gray-700 dark:text-white/70">
        Products I founded — from revenue-generating tools to VC-targeted
        platforms. The promising ones are moving forward; the rest are archived
        but still running.
      </p>

      <div className="mx-auto grid max-w-[53rem] grid-cols-1 gap-5 sm:grid-cols-2 items-stretch">
        {venturesData.map((venture, index) => (
          <VentureCard key={venture.name} venture={venture} index={index} />
        ))}
      </div>

      {/* Invitation CTA */}
      <motion.div
        className="mx-auto mt-10 flex max-w-[53rem] flex-col items-center gap-4 rounded-2xl border border-indigo-200/60 bg-indigo-50/60 px-6 py-8 text-center dark:border-indigo-800/40 dark:bg-indigo-900/20 sm:flex-row sm:justify-between sm:text-left"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="max-w-md text-sm font-medium text-indigo-900 dark:text-indigo-200">
          <FaRocket className="mr-2 inline-block text-indigo-500 dark:text-indigo-300" aria-hidden />
          {venturesCta.text}
        </p>
        <a
          href="#contact"
          className="inline-flex min-h-[44px] items-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:bg-indigo-700"
        >
          {venturesCta.ctaLabel}
        </a>
      </motion.div>
    </section>
  );
}
