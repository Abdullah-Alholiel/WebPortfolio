"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaPlus, FaMinus, FaExternalLinkAlt } from "react-icons/fa";
import { resolveImageUrl } from "@/lib/image-utils";
import { getProjectFallbackImage } from "@/lib/project-fallbacks";

type ExperienceItem = {
  title: string;
  location: string;
  description: string;
  date: string;
  icon?: string;
  key?: string;
  type?: "experience" | "education" | "bio-education";
};

/** Product stage for founded products (future section). Absent = no badge. */
export type ProjectStage = "hobby" | "exited" | "vc-targeted";

const STAGE_STYLES: Record<ProjectStage, string> = {
  hobby: "bg-amber-500/90 text-white",
  exited: "bg-emerald-600/90 text-white",
  "vc-targeted": "bg-violet-600/90 text-white",
};

const STAGE_LABELS: Record<ProjectStage, string> = {
  hobby: "Hobby product",
  exited: "Exited",
  "vc-targeted": "VC-targeted",
};

type ProjectProps = {
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  fallbackImageUrl?: string;
  experienceKey?: string;
  stage?: ProjectStage;
  allExperiences?: ExperienceItem[];
};

const VISIBLE_TAGS = 4;

export default function Project({
  title,
  description,
  tags,
  imageUrl,
  fallbackImageUrl,
  experienceKey,
  stage,
  allExperiences,
}: ProjectProps) {
  const linkedExperience = allExperiences?.find((exp) => exp.key === experienceKey);
  const isBioEducation = experienceKey?.startsWith("bio-");
  const buttonText = isBioEducation
    ? 'Developed during "' + linkedExperience?.title + '" Studies'
    : 'Developed during "' + linkedExperience?.title + '" Experience';

  const [tagsExpanded, setTagsExpanded] = useState(false);

  const titleFallback = useMemo(
    () =>
      getProjectFallbackImage({
        title,
        remoteUrl: imageUrl,
        fallbackCandidate: fallbackImageUrl,
      }),
    [title, imageUrl, fallbackImageUrl]
  );
  const resolvedPrimary = useMemo(() => resolveImageUrl({ url: imageUrl }), [imageUrl]);
  const resolvedFallback = useMemo(() => {
    if (titleFallback) {
      const mappedFallback = resolveImageUrl({ url: titleFallback });
      if (mappedFallback) {
        return mappedFallback;
      }
    }
    return null;
  }, [titleFallback]);
  const [imageFallbackUsed, setImageFallbackUsed] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(() => {
    if (resolvedPrimary) return resolvedPrimary;
    if (resolvedFallback) return resolvedFallback;
    return "/favicon.ico";
  });

  useEffect(() => {
    let cancelled = false;

    const applyFallback = () => {
      if (cancelled) return;
      if (resolvedFallback) {
        setCurrentImageSrc(resolvedFallback);
        setImageFallbackUsed(true);
      } else {
        setCurrentImageSrc("/favicon.ico");
        setImageFallbackUsed(true);
      }
    };

    if (!resolvedPrimary) {
      applyFallback();
      return () => {
        cancelled = true;
      };
    }

    if (typeof window === "undefined") {
      applyFallback();
      return () => {
        cancelled = true;
      };
    }

    const img = new window.Image();
    img.onload = () => {
      if (cancelled) return;
      setCurrentImageSrc(resolvedPrimary);
      setImageFallbackUsed(false);
    };
    img.onerror = () => {
      applyFallback();
    };
    img.src = resolvedPrimary;

    return () => {
      cancelled = true;
    };
  }, [resolvedPrimary, resolvedFallback]);

  const fallbackSrc = resolvedFallback ?? "/favicon.ico";

  const handleImageError = () => {
    if (!imageFallbackUsed) {
      setImageFallbackUsed(true);
      setCurrentImageSrc(fallbackSrc);
    } else if (currentImageSrc !== "/favicon.ico") {
      setCurrentImageSrc("/favicon.ico");
    }
  };

  const visibleTags = tagsExpanded ? tags : tags.slice(0, VISIBLE_TAGS);
  const hiddenTagCount = tags.length - VISIBLE_TAGS;
  const targetHash = isBioEducation ? "about" : "experience";
  // Stable anchor so founder-section cards can deep-link to this project
  const anchorId = `project-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

  const scrollToExperience = () => {
    const targetElement = document.getElementById(experienceKey || "");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      document
        .querySelector(`#${targetHash}`)
        ?.scrollIntoView({ behavior: "smooth" });
    }
    history.pushState(null, "", `#${targetHash}`);
  };

  return (
    <motion.article
      id={anchorId}
      className="group relative flex h-full scroll-mt-32 flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg dark:border-white/10 dark:bg-white/10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Stage badge (founded products) */}
      {stage && (
        <span
          className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-sm backdrop-blur-sm ${STAGE_STYLES[stage]}`}
        >
          {STAGE_LABELS[stage]}
        </span>
      )}

      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          key={currentImageSrc}
          src={currentImageSrc}
          alt={`${title} preview`}
          quality={90}
          fill
          sizes="(max-width: 640px) 100vw, 26rem"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={handleImageError}
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-700 dark:text-white/70">
          {description}
        </p>

        {/* Tags — first 4 + expandable rest */}
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {visibleTags.map((tag, index) => (
            <li
              className="rounded-full bg-black/[0.7] px-2.5 py-1 text-[0.65rem] uppercase tracking-wider text-white dark:bg-white/15 dark:text-white/80"
              key={`${tag}-${index}`}
            >
              {tag}
            </li>
          ))}
          {tags.length > VISIBLE_TAGS && (
            <li>
              <button
                type="button"
                onClick={() => setTagsExpanded((v) => !v)}
                aria-expanded={tagsExpanded}
                aria-label={
                  tagsExpanded
                    ? `Show fewer tags for ${title}`
                    : `Show ${hiddenTagCount} more tags for ${title}`
                }
                className="inline-flex min-h-[28px] items-center gap-1 rounded-full border border-dashed border-black/30 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:border-black/60 hover:bg-black/5 dark:border-white/30 dark:text-white/80 dark:hover:border-white/60 dark:hover:bg-white/10"
              >
                {tagsExpanded ? (
                  <FaMinus className="text-[8px]" aria-hidden />
                ) : (
                  <FaPlus className="text-[8px]" aria-hidden />
                )}
                {tagsExpanded ? "less" : `${hiddenTagCount}`}
              </button>
            </li>
          )}
        </ul>

        {/* Experience link */}
        {experienceKey && (
          <button
            type="button"
            onClick={scrollToExperience}
            className="group/btn mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/60 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-all hover:bg-indigo-100 dark:border-indigo-800/50 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
          >
            <span className="text-left leading-tight">{buttonText}</span>
            <FaExternalLinkAlt
              className="text-[9px] transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
              aria-hidden
            />
          </button>
        )}
      </div>
    </motion.article>
  );
}
