"use client";

import React from "react";
import SectionHeading from "./section-heading";
import Project from "./project";
import { useSectionInView } from "@/lib/hooks";
import { usePortfolioData } from "@/context/portfolio-data-context";
import Loader from "@/components/ui/loader";

export default function Projects() {
  const { ref } = useSectionInView("Projects", 0.1);
  const { data, loading: isLoading } = usePortfolioData();
  const projects = data.projects || [];
  const experiences = data.experiences || [];

  // Add static bio education options to experiences list
  const allExperiences = [
    ...experiences,
    { title: "Bachelor's Degree", date: '2022', key: 'bio-bachelors-2022', type: 'bio-education' },
    { title: "Master's Degree", date: '2024', key: 'bio-masters-2024', type: 'bio-education' },
  ];

  if (isLoading) {
    return (
      <section id="projects" ref={ref} className="scroll-mt-28 mb-28">
        <SectionHeading>Projects</SectionHeading>
        <Loader className="w-full justify-center" label="Loading projects" />
      </section>
    );
  }

  return (
    <section id="projects" ref={ref} className="scroll-mt-28 mb-28">
      <SectionHeading>Projects</SectionHeading>
      <div className="mx-auto grid max-w-[53rem] grid-cols-1 gap-5 sm:grid-cols-2 items-stretch">
        {projects.map((project, index) => (
          <Project key={project.title || index} {...project} allExperiences={allExperiences} />
        ))}
      </div>
    </section>
  );
}
