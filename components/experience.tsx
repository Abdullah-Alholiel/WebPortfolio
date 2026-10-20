// experience.tsx
import React, { useState } from "react";
import SectionHeading from "./section-heading";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import {
  FaVideo,
  FaFutbol,
  FaMapMarkedAlt,
  FaTasks,
  FaRunning,
  FaGraduationCap,
} from "react-icons/fa";
import { useSectionInView } from "@/lib/hooks";
import { useTheme } from "@/context/theme-context";
import { usePortfolioData } from "@/context/portfolio-data-context";
import { getExperienceIcon } from "@/lib/icon-utils";
import StandardIcon from "./standard-icon";
import Loader from "@/components/ui/loader";

type JourneyMode = "professional" | "entrepreneurial";

interface ExperienceItem {
  title: string;
  location?: string;
  description: string;
  date: string;
  key?: string;
  icon?: string | any;
}

/**
 * Founder timeline entries: the founded products from the Founder section
 * also live in the Entrepreneurial journey.
 *
 * Dates: SaudiEase / Momentum / KoraLink are GitHub-anchored (repo created);
 * the rest follow the founder order as adequate estimates.
 * Ventures that already have a live founder entry (e.g. "Ogra Founder")
 * are skipped at runtime, so nothing duplicates.
 */
const FOUNDER_TIMELINE: ExperienceItem[] = [
  {
    title: "Plug & Play Video Analytics",
    location: "Self-founded",
    description:
      "Founded and sold a plug-and-play video analytics product for local stores, turning camera feeds into footfall and behaviour insights without custom integration work.",
    date: "01/2022 - 12/2022",
    icon: FaVideo,
    key: "founder-video-analytics",
  },
  {
    title: "AI Football Trivia",
    location: "Self-founded",
    description:
      "Founded a football trivia game powered by retrieval-augmented generation, with questions grounded in real football knowledge and adaptive difficulty.",
    date: "01/2025 - 04/2025",
    icon: FaFutbol,
    key: "founder-ai-football-trivia",
  },
  {
    title: "SaudiEase",
    location: "Self-founded",
    description:
      "Founded a digital companion for life in Saudi Arabia: services, attractions and everyday essentials in one place for residents and visitors.",
    date: "05/2025 - 10/2025",
    icon: FaMapMarkedAlt,
    key: "founder-saudiease",
  },
  {
    title: "Momentum",
    location: "Self-founded",
    description:
      "Founded an accountability app where friends co-own tasks, log completions and keep each other's streaks alive across devices.",
    date: "11/2025 - 05/2026",
    icon: FaTasks,
    key: "founder-momentum",
  },
  {
    title: "KoraLink",
    location: "Self-founded",
    description:
      "Founded a sports matchmaking platform connecting players, pitches and games, and currently leading its development.",
    date: "03/2026 - Present",
    icon: FaRunning,
    key: "founder-koralink",
  },
  {
    title: "KnowStride",
    location: "Self-founded",
    description:
      "Founding an enterprise upskilling platform for training agencies, with adaptive learning journeys and verifiable quality.",
    date: "07/2026 - Present",
    icon: FaGraduationCap,
    key: "founder-knowstride",
  },
];

/**
 * Mode classification for the Journey toggle.
 * Professional = employed / client engagements.
 * Entrepreneurial = self-directed ventures and founded initiatives.
 * Anything with "founder" in the title, or one of the founder- timeline
 * keys above, is entrepreneurial by definition.
 */
const ENTREPRENEURIAL_TITLES = new Set([
  "Freelance E-commerce Specialist",
  "Event Organizer",
]);

function modeOf(item: ExperienceItem): JourneyMode {
  if (item.key?.startsWith("founder-")) return "entrepreneurial";
  if (/founder/i.test(item.title)) return "entrepreneurial";
  return ENTREPRENEURIAL_TITLES.has(item.title) ? "entrepreneurial" : "professional";
}

const MODES: { id: JourneyMode; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "entrepreneurial", label: "Entrepreneurial" },
];

export default function Experience() {
  const { ref } = useSectionInView("Experience", 0.3);
  const { theme } = useTheme();
  const { data, loading: isLoading } = usePortfolioData();
  const [mode, setMode] = useState<JourneyMode>("professional");

  // Merge founder venture entries with live data, skipping anything live
  // already covers (e.g. "Ogra Founder"), then classify + sort.
  const liveExperiences: ExperienceItem[] = data.experiences || [];
  const liveKeys = new Set(
    liveExperiences.map((e) => e.key?.toLowerCase()).filter(Boolean) as string[]
  );
  const liveTitles = new Set(
    liveExperiences.map((e) => e.title.toLowerCase().replace(/[^a-z0-9]+/g, ""))
  );
  const founderEntries = FOUNDER_TIMELINE.filter((venture) => {
    const slug = venture.title.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (liveKeys.has(venture.key!.toLowerCase())) return false;
    // Live title contains the venture name (e.g. "Ogra Founder" covers "Ogra")
    for (const t of Array.from(liveTitles)) {
      if (t.includes(slug) || slug.includes(t)) return false;
    }
    return true;
  });

  const experiences: ExperienceItem[] = [...liveExperiences, ...founderEntries]
    .filter((item) => modeOf(item) === mode)
    .sort((a, b) => {
      const parseDate = (dateStr: string) => {
        const parts = dateStr.split(' - ');
        const startStr = parts[0]?.trim() || '';
        const endStr = parts[1]?.trim() || '';

        const parseMonthYear = (str: string) => {
          const p = str.split('/');
          const month = parseInt(p[0], 10) || 1;
          const year = parseInt(p[1], 10) || new Date().getFullYear();
          return new Date(year, month - 1, 1);
        };

        const start = parseMonthYear(startStr);
        let end: Date | null = null;
        if (endStr.toLowerCase() === 'present') {
          end = new Date();
        } else if (endStr) {
          end = parseMonthYear(endStr);
        }
        return end ?? start;
      };

      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });

  // Function to get icon component from item (for VerticalTimeline which needs the component)
  const getIcon = (item: ExperienceItem) => {
    // If icon is already a function/component, return it (for backward compatibility)
    if (typeof item.icon === 'function') {
      return item.icon;
    }

    // Use the centralized icon utility to get icon from string name
    return getExperienceIcon(item.icon);
  };

  if (isLoading) {
    return (
      <section id="experience" ref={ref} className="scroll-mt-28 mb-28 sm:mb-40">
        <SectionHeading>Professional Journey</SectionHeading>
        <div className="flex flex-col items-center py-12 gap-4">
          <Loader className="justify-center" label="Loading experiences" />
          <p className="text-gray-600 dark:text-gray-400">Loading experiences...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="experience" ref={ref} className="scroll-mt-28 mb-28 sm:mb-40">
      <SectionHeading>{mode === "professional" ? "Professional Journey" : "Entrepreneurial Journey"}</SectionHeading>

      {/* Journey mode toggle */}
      <div className="mb-12 flex justify-center">
        <div
          role="group"
          aria-label="Journey mode"
          className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white p-1 shadow-sm dark:border-white/15 dark:bg-white/10"
        >
          {MODES.map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                data-mode={m.id}
                onClick={() => setMode(m.id)}
                aria-pressed={active}
                className={`min-h-[40px] rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-gray-900 text-white shadow dark:bg-white dark:text-gray-900"
                    : "text-gray-600 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No {mode} entries to display.
          </p>
        </div>
      ) : (
        <VerticalTimeline lineColor="" className="vertical-timeline-custom-line">
          {experiences.map((item, index) => {
            const IconComponent = getIcon(item);

            return (
              <VerticalTimelineElement
                id={item.key}
                key={`${item.title}-${index}-${item.date}`}
                contentStyle={{
                  background:
                    theme === "light" ? "#f3f4f6" : "rgba(255, 255, 255, 0.05)",
                  boxShadow: "none",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  textAlign: "left",
                  padding: "1.5rem 2rem",
                  borderRadius: "0.5rem",
                }}
                contentArrowStyle={{
                  borderRight:
                    theme === "light"
                      ? "0.4rem solid #9ca3af"
                      : "0.4rem solid rgba(255, 255, 255, 0.5)",
                }}
                date={item.date || ''}
                icon={
                  <StandardIcon
                    icon={item.icon}
                    variant="timeline"
                    size="lg"
                  />
                }
                iconStyle={{
                  background:
                    theme === "light"
                      ? "#fff"
                      : "#1f2937",
                  width: "42px",
                  height: "42px",
                  minWidth: "42px",
                  maxWidth: "42px",
                  minHeight: "42px",
                  maxHeight: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: 0,
                  padding: "8px",
                  boxShadow: theme === "light"
                    ? "0 0 0 3px #f3f4f6, inset 0 2px 0 rgba(0,0,0,.08), 0 3px 0 3px rgba(0,0,0,.05)"
                    : "0 0 0 3px rgba(255, 255, 255, 0.05), inset 0 2px 0 rgba(255,255,255,.08), 0 3px 0 3px rgba(0,0,0,.05)",
                  boxSizing: "border-box",
                }}
                iconClassName="vertical-timeline-element-icon-centered"
                visible={true}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold capitalize text-lg text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  {item.location && (
                    <p className="font-medium !mt-0 text-gray-700 dark:text-gray-300">
                      {item.location}
                    </p>
                  )}
                  <p className="!mt-2 !font-normal text-gray-600 dark:text-white/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </VerticalTimelineElement>
            );
          })}
        </VerticalTimeline>
      )}
    </section>
  );
}
