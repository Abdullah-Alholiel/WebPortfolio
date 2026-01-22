"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { resolveImageUrl } from "@/lib/image-utils";
import { getProjectFallbackImage } from "@/lib/project-fallbacks";
import { FaExternalLinkAlt } from "react-icons/fa";

type ExperienceItem = {
  title: string;
  location: string;
  description: string;
  date: string;
  icon?: string;
  key?: string;
  type?: 'experience' | 'education' | 'bio-education';
};

type ProjectProps = {
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  fallbackImageUrl?: string;
  experienceKey?: string;
  allExperiences?: ExperienceItem[];
};

export default function Project({
  title,
  description,
  tags,
  imageUrl,
  fallbackImageUrl,
  experienceKey,
  allExperiences,
}: ProjectProps) {
  const linkedExperience = allExperiences?.find(exp => exp.key === experienceKey);

  // Determine if it's a bio education or work experience
  const isBioEducation = experienceKey?.startsWith('bio-');

  // Get button text based on what's linked
  const buttonText = isBioEducation ? 'Developed during "' + linkedExperience?.title + '" Studies' : 'Developed during "' + linkedExperience?.title + '" Experience';
  const targetSection = isBioEducation ? 'about' : 'experience';
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  });
  const scaleProgess = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgess = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  const titleFallback = useMemo(
    () => getProjectFallbackImage({ title, remoteUrl: imageUrl, fallbackCandidate: fallbackImageUrl }),
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
    if (resolvedPrimary) {
      return resolvedPrimary;
    }
    if (resolvedFallback) {
      return resolvedFallback;
    }
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
      // During SSR fall back immediately to avoid hydration mismatch
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

  return (
    <motion.div
      ref={ref}
      style={{
        scale: scaleProgess,
        opacity: opacityProgess,
      }}
      className="group mb-3 sm:mb-8 last:mb-0"
    >
      <section className="bg-gray-100 max-w-[42rem] border border-black/5 rounded-lg overflow-hidden sm:pr-8 relative min-h-[20rem] hover:bg-gray-200 transition sm:group-even:pl-8 dark:text-white dark:bg-white/10 dark:hover:bg-white/20">
        <Image
          key={currentImageSrc}
          src={currentImageSrc}
          alt="Project I worked on"
          quality={95}
          width={904}
          height={600}
          className="relative w-full h-auto rounded-t-lg shadow-2xl mb-4
        sm:absolute sm:top-8 sm:-right-40 sm:w-[28.25rem] sm:mb-0
        sm:group-hover:scale-[1.04]
        sm:group-hover:-translate-x-3
        sm:group-hover:translate-y-3
        sm:group-hover:-rotate-2

        sm:group-even:group-hover:translate-x-3
        sm:group-even:group-hover:translate-y-3
        sm:group-even:group-hover:rotate-2

        sm:group-even:right-[initial] sm:group-even:-left-40"
          onError={handleImageError}
        />

        <div className="pt-4 pb-7 px-5 sm:pl-10 sm:pr-2 sm:pt-10 sm:max-w-[50%] flex flex-col justify-center sm:group-even:ml-[18rem]">
          <h3 className="text-xl sm:text-2xl font-semibold">{title}</h3>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-white/70">
            {description}
          </p>
          <ul className="flex flex-wrap mt-4 gap-2">
            {tags.map((tag, index) => (
              <li
                className="bg-black/[0.7] px-2 py-1 text-[0.65rem] sm:text-[0.7rem] uppercase tracking-wider text-white rounded-full dark:text-white/70"
                key={index}
              >
                {tag}
              </li>
            ))}
          </ul>
          {experienceKey && (
            <button
              onClick={() => {
                const targetId = experienceKey || '';
                const targetElement = document.getElementById(targetId);
                const targetSection = document.querySelector(`#${isBioEducation ? 'about' : 'experience'}`);

                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Also push state but keep the hash as the section for cleaner URL or use the key if preferred
                  history.pushState(null, '', `#${isBioEducation ? 'about' : 'experience'}`);
                } else if (targetSection) {
                  targetSection.scrollIntoView({ behavior: 'smooth' });
                  history.pushState(null, '', `#${isBioEducation ? 'about' : 'experience'}`);
                }
              }}
              className="group/btn mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200/50 bg-indigo-50/50 px-4 py-2 text-xs font-medium text-indigo-700 backdrop-blur-sm transition-all hover:bg-indigo-100 hover:shadow-sm dark:border-indigo-800/50 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/40 sm:text-sm"
            >
              <span className="text-left">{buttonText}</span>
              <FaExternalLinkAlt className="ml-1 text-[10px] transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
            </button>
          )}
        </div>
      </section>
    </motion.div>
  );
}
