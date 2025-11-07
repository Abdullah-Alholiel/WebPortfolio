// experience.tsx
import React from "react";
import SectionHeading from "./section-heading";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { useSectionInView } from "@/lib/hooks";
import { useTheme } from "@/context/theme-context";
import { usePortfolioData } from "@/context/portfolio-data-context";
import { getExperienceIcon } from "@/lib/icon-utils";
import StandardIcon from "./standard-icon";
import Loader from "@/components/ui/loader";

interface ExperienceItem {
  title: string;
  location?: string;
  description: string;
  date: string;
  icon?: string | any;
}

export default function Experience() {
  const { ref } = useSectionInView("Experience", 0.3);
  const { theme } = useTheme();
  const { data, loading: isLoading } = usePortfolioData();
  const experiences: ExperienceItem[] = data.experiences || [];

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

  if (experiences.length === 0) {
    return (
      <section id="experience" ref={ref} className="scroll-mt-28 mb-28 sm:mb-40">
        <SectionHeading>Professional Journey</SectionHeading>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No experiences to display.</p>
        </div>
      </section>
    );
  }

  // Experiences are already in newest-first order (prepended in API)
  return (
    <section id="experience" ref={ref} className="scroll-mt-28 mb-28 sm:mb-40">
      <SectionHeading>Professional Journey</SectionHeading>
      <VerticalTimeline lineColor="" className="vertical-timeline-custom-line">
        {experiences.map((item, index) => {
          const IconComponent = getIcon(item);
          
          return (
            <VerticalTimelineElement
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
                    : "rgba(255, 255, 255, 0.15)",
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
    </section>
  );
}