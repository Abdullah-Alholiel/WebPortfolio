"use client";

import React, { useEffect, useState } from "react";
import SectionHeading from "./section-heading";
import { resolveCopy } from "@/lib/site-copy";
import Project from "./project";
import { useSectionInView } from "@/lib/hooks";
import { usePortfolioData } from "@/context/portfolio-data-context";
import { FaChevronDown } from "react-icons/fa";
import Loader from "@/components/ui/loader";

// Projects that already star in the Founder section stay behind the
// "Show all" toggle so the grid doesn't repeat itself. Matching is
// keyword-based so it survives title edits in the admin.
const FOUNDER_PROJECT_MATCHERS = [/trivia/i, /hailing|ogra/i, /video analytics/i];

export default function Projects() {
  const { ref } = useSectionInView("Projects", 0.1);
  const { data, loading: isLoading } = usePortfolioData();
  const projects = data.projects || [];
  const experiences = data.experiences || [];
  const [showAll, setShowAll] = useState(false);

  const isFounderProject = (title?: string) =>
    Boolean(title) && FOUNDER_PROJECT_MATCHERS.some((re) => re.test(title!));

  const founderCount = projects.filter((p) => isFounderProject(p.title)).length;
  const visibleProjects = showAll
    ? projects
    : projects.filter((p) => !isFounderProject(p.title));

  // Arriving from a Founder card link (#project-...) must reveal the target.
  useEffect(() => {
    const revealIfDeepLink = () => {
      if (window.location.hash.startsWith("#project-")) {
        setShowAll(true);
        // The card mounts after the reveal — wait a frame, then scroll.
        window.setTimeout(() => {
          document
            .getElementById(window.location.hash.slice(1))
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    };
    revealIfDeepLink();
    window.addEventListener("hashchange", revealIfDeepLink);
    return () => window.removeEventListener("hashchange", revealIfDeepLink);
  }, []);

  // Add static bio education options to experiences list
  const allExperiences = [
    ...experiences,
    { title: "Bachelor's Degree", date: '2022', key: 'bio-bachelors-2022', type: 'bio-education' },
    { title: "Master's Degree", date: '2024', key: 'bio-masters-2024', type: 'bio-education' },
  ];

  if (isLoading) {
    return (
      <section id="projects" ref={ref} className="scroll-mt-28 mb-28">
        <SectionHeading>{resolveCopy(data.siteCopy, 'projects.title', 'Projects')}</SectionHeading>
        <Loader className="w-full justify-center" label="Loading projects" />
      </section>
    );
  }

  return (
    <section id="projects" ref={ref} className="scroll-mt-28 mb-28">
      <SectionHeading>{resolveCopy(data.siteCopy, 'projects.title', 'Projects')}</SectionHeading>
      <div className="mx-auto grid max-w-[53rem] grid-cols-1 gap-5 sm:grid-cols-2 items-stretch">
        {visibleProjects.map((project, index) => (
          <Project key={project.title || index} {...project} allExperiences={allExperiences} />
        ))}
      </div>

      {!showAll && founderCount > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            aria-expanded={false}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-all hover:border-black/25 hover:shadow dark:border-white/15 dark:bg-white/10 dark:text-white/90 dark:hover:border-white/40"
          >
            <FaChevronDown className="text-xs opacity-60" aria-hidden />
            {founderCount === 1
              ? "Show 1 more project"
              : `Show ${founderCount} more projects`}
          </button>
        </div>
      )}
    </section>
  );
}
