// skills.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import SectionHeading from "./section-heading";
import { useSectionInView } from "@/lib/hooks";
import { usePortfolioData } from '@/context/portfolio-data-context';
import { resolveCopy } from '@/lib/site-copy';
import { motion } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Loader from "@/components/ui/loader";

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  animate: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: 0.05 * Math.min(index, 12),
      type: "spring",
      stiffness: 400,
      damping: 20,
      mass: 0.8,
    },
  }),
  whileHover: {
    scale: 1.05,
    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  whileTap: {
    scale: 0.98,
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.08)",
  },
};

const COLLAPSED_ROWS = 2;

/** Measures how many chips fit in the first N visual rows of a wrapping flex list. */
function useCollapsedChipCount(
  listRef: React.RefObject<HTMLUListElement>,
  expanded: boolean
) {
  const [count, setCount] = useState<number | null>(null); // null = all fit in N rows

  const measure = useCallback(() => {
    const ul = listRef.current;
    if (!ul) return;
    const chips = Array.from(
      ul.querySelectorAll<HTMLElement>("[data-chip]")
    );
    if (chips.length === 0) return;

    // Row identity = chip offsetTop (equal within a row)
    const rowTops: number[] = [];
    const rowsOf = chips.map((chip) => {
      const top = chip.offsetTop;
      let row = rowTops.indexOf(top);
      if (row === -1) {
        rowTops.push(top);
        row = rowTops.length - 1;
      }
      return row;
    });
    const totalRows = rowTops.length;
    if (totalRows <= COLLAPSED_ROWS) {
      setCount(null); // everything fits
      return;
    }
    const firstRowBeyond = chips.findIndex((_, i) => rowsOf[i] >= COLLAPSED_ROWS);
    setCount(firstRowBeyond > 0 ? firstRowBeyond : 1);
  }, [listRef]);

  useEffect(() => {
    if (expanded) return; // no measurement needed while expanded
    // Wait for fonts (wrap width changes after webfont load)
    const run = () => measure();
    run();
    let raf = requestAnimationFrame(run);
    if (typeof document !== "undefined" && (document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => run()).catch(() => {});
    }
    window.addEventListener("resize", run);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", run);
    };
  }, [expanded, measure]);

  return count;
}

function SkillCategory({
  category,
  skillsArray,
}: {
  category: string;
  skillsArray: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const collapsedCount = useCollapsedChipCount(listRef, expanded);
  const needsToggle = collapsedCount !== null;
  const visibleSkills = needsToggle && !expanded
    ? skillsArray.slice(0, collapsedCount)
    : skillsArray;

  return (
    <div className="mb-10">
      <h3 className="text-lg font-semibold text-gray-600 mb-4 dark:text-gray-300">
        {category}
      </h3>

      <motion.ul
        ref={listRef}
        className="flex flex-wrap justify-center gap-4 text-sm text-gray-800 dark:text-gray-200"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        {visibleSkills.map((skill: string, skillIndex: number) => (
          <motion.li
            className="bg-white borderBlack rounded-lg px-4 py-2 dark:bg-white/10 dark:text-white/80 cursor-default shadow-md"
            key={skill}
            data-chip
            variants={fadeInAnimationVariants}
            custom={skillIndex}
            whileHover="whileHover"
            whileTap="whileTap"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
          >
            <span className="inline-block">{skill}</span>
          </motion.li>
        ))}
      </motion.ul>

      {/* Collapsed 2-row state → centred "Show all" toggle */}
      {needsToggle && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={`skills-${category.replace(/\W+/g, "-").toLowerCase()}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-all hover:border-black/25 hover:shadow dark:border-white/15 dark:bg-white/10 dark:text-white/90 dark:hover:border-white/40"
          >
            {expanded ? (
              <FaChevronUp className="text-xs opacity-60" aria-hidden />
            ) : (
              <FaChevronDown className="text-xs opacity-60" aria-hidden />
            )}
            {expanded ? "Show less" : `Show all (${skillsArray.length})`}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Skills() {
  const { ref } = useSectionInView("Skills", 0.3);
  const { data, loading: isLoading } = usePortfolioData();
  const skills = data.skills || {};

  if (isLoading) {
    return (
      <section
        id="skills"
        ref={ref}
        className="mb-20 max-w-[53rem] scroll-mt-28 text-center sm:mb-8"
      >
        <SectionHeading>{resolveCopy(data.siteCopy, 'skills.title', 'Skills')}</SectionHeading>
        <div className="mt-8 flex justify-center">
          <Loader label="Loading skills" />
        </div>
      </section>
    );
  }

  return (
    <section
      id="skills"
      ref={ref}
      className="mb-20 max-w-[53rem] scroll-mt-28 text-center sm:mb-8"
    >
      <SectionHeading>{resolveCopy(data.siteCopy, 'skills.title', 'Skills')}</SectionHeading>
      {Object.entries(skills).map(([category, categorySkills], index) => {
        const skillsArray = Array.isArray(categorySkills)
          ? categorySkills.filter(
              (skill) => typeof skill === "string" && skill.trim() !== ""
            )
          : [];

        if (skillsArray.length === 0) return null;

        return (
          <SkillCategory
            key={`${category}-${index}`}
            category={category}
            skillsArray={skillsArray}
          />
        );
      })}
    </section>
  );
}
