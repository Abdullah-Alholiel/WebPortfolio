// experience.tsx
import React, { useState } from "react";
import SectionHeading from "./section-heading";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { useSectionInView } from "@/lib/hooks";
import { useTheme } from "@/context/theme-context";
import { usePortfolioData } from "@/context/portfolio-data-context";
import { resolveCopy } from "@/lib/site-copy";
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
  source?: 'founder-seed' | 'admin';
}

/**
 * Founder ventures are NOT hardcoded here any more.
 *
 * They used to live in a FOUNDER_TIMELINE constant in this file, merged with
 * live data at render time — which meant the admin panel could never show or
 * edit them (they were never in the database). They are now seeded into
 * Upstash by lib/founder-seed.ts via the admin experience route, and flow
 * through the normal data context like every other entry.
 *
 * Mode classification for the Journey toggle.
 * Professional = employed / client engagements.
 * Entrepreneurial = self-directed ventures and founded initiatives.
 * Anything with "founder" in the title or key is entrepreneurial by definition.
 */
const ENTREPRENEURIAL_TITLES = new Set([
  "Freelance E-commerce Specialist",
  "Event Organizer",
]);

function modeOf(item: ExperienceItem): JourneyMode {
  if (item.key?.startsWith("founder-")) return "entrepreneurial";
  if (/founder/i.test(item.title)) return "entrepreneurial";
  if (item.source === "founder-seed") return "entrepreneurial";
  return ENTREPRENEURIAL_TITLES.has(item.title) ? "entrepreneurial" : "professional";
}

const MODES: { id: JourneyMode; copyKey: string; label: string }[] = [
  { id: "professional", copyKey: "experience.mode.professional", label: "Professional" },
  { id: "entrepreneurial", copyKey: "experience.mode.entrepreneurial", label: "Entrepreneurial" },
];

export default function Experience() {
  const { ref } = useSectionInView("Experience", 0.3);
  const { theme } = useTheme();
  const { data, loading: isLoading } = usePortfolioData();
  const [mode, setMode] = useState<JourneyMode>("professional");

  // All entries come from the database now (founder seeds included), so the
  // component simply classifies + sorts. No hardcoded merge.
  const liveExperiences: ExperienceItem[] = data.experiences || [];

  const experiences: ExperienceItem[] = [...liveExperiences]
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
        <SectionHeading>{resolveCopy(data.siteCopy, 'experience.title.professional')}</SectionHeading>
        <div className="flex flex-col items-center py-12 gap-4">
          <Loader className="justify-center" label="Loading experiences" />
          <p className="text-gray-600 dark:text-gray-400">Loading experiences...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="experience" ref={ref} className="scroll-mt-28 mb-28 sm:mb-40">
      <SectionHeading>
        {resolveCopy(
          data.siteCopy,
          mode === "professional"
            ? "experience.title.professional"
            : "experience.title.entrepreneurial"
        )}
      </SectionHeading>

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
                {resolveCopy(data.siteCopy, m.copyKey, m.label)}
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
