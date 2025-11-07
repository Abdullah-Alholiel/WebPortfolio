"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { resolveImageUrl } from "@/lib/image-utils";
import { getProjectFallbackImage } from "@/lib/project-fallbacks";

type ProjectProps = {
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  fallbackImageUrl?: string;
};

export default function Project({
  title,
  description,
  tags,
  imageUrl,
  fallbackImageUrl,
}: ProjectProps) {
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
        </div>

        <Image
          key={currentImageSrc}
          src={currentImageSrc}
          alt="Project I worked on"
          quality={95}
          width={904}
          height={600}
          className="absolute hidden sm:block top-8 -right-40 w-[28.25rem] rounded-t-lg shadow-2xl
        transition 
        group-hover:scale-[1.04]
        group-hover:-translate-x-3
        group-hover:translate-y-3
        group-hover:-rotate-2

        group-even:group-hover:translate-x-3
        group-even:group-hover:translate-y-3
        group-even:group-hover:rotate-2

        group-even:right-[initial] group-even:-left-40"
          onError={handleImageError}
        />
      </section>
    </motion.div>
  );
}
