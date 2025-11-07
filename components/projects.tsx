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
  // Projects are already in newest-first order from API (prepended)

  if (isLoading) {
    return (
      <section id="projects" ref={ref} className="scroll-mt-28 mb-28">
        <SectionHeading>My projects</SectionHeading>
        <Loader className="w-full justify-center" label="Loading projects" />
      </section>
    );
  }

  return (
    <section id="projects" ref={ref} className="scroll-mt-28 mb-28">
      <SectionHeading>My projects</SectionHeading>
      <div>
        {projects.map((project, index) => (
          <React.Fragment key={project.title || index}>
            <Project {...project} />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

