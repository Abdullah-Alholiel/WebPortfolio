// About.tsx
'use client';

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/theme-context";
import { usePortfolioData } from "@/context/portfolio-data-context";
import Link from "next/link";
import { useSectionInView } from "@/lib/hooks";

const AboutMe = () => {
  const { ref } = useSectionInView("About", 0.3);
  const { theme } = useTheme();
  const { data } = usePortfolioData();
  const personalInfo = data.personal;

  const highlightStyle = `text-indigo-600 dark:text-indigo-400 font-semibold hover:underline decoration-2 decoration-indigo-400 underline-offset-2 transition-all cursor-pointer`;

  // Function to enhance text with clickable skill links
  const enhanceTextWithLinks = (text: string) => {
    const skillPatterns = [
      { pattern: /software development/gi, hash: "#skills" },
      { pattern: /cloud computing/gi, hash: "#skills" },
      { pattern: /data analytics/gi, hash: "#skills" },
      { pattern: /Aerospace Engineering/gi, hash: "#experience" },
      { pattern: /Master's in Applied Computing/gi, hash: "#experience" },
    ];

    let enhancedText = text;
    skillPatterns.forEach(({ pattern, hash }) => {
      enhancedText = enhancedText.replace(
        pattern,
        (match) => `<a href="${hash}" class="${highlightStyle}">${match}</a>`
      );
    });

    return enhancedText;
  };

  return (
    <motion.section
      ref={ref}
      id="about"
      className="mb-16 scroll-mt-28 relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Subtle Decorative Elements */}
      <div className="absolute -top-32 right-20 w-80 h-80 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-8 animate-blob animation-delay-4000"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">

        <div
          className={`relative rounded-2xl sm:rounded-3xl p-6 sm:p-10 ${
            theme === "dark" 
              ? "bg-gradient-to-br from-gray-800/95 via-gray-800/90 to-gray-900/95" 
              : "bg-gradient-to-br from-white via-gray-50/50 to-white"
          } shadow-xl backdrop-blur-sm border ${
            theme === "dark" ? "border-gray-700/50" : "border-gray-200"
          } overflow-hidden`}
        >
          {/* Subtle Decorative Corner Accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/8 to-purple-500/8 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/8 to-pink-500/8 rounded-tr-full"></div>
          
          <div className="relative z-10">
            {/* Title with Consistent Spacing */}
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            >
              <div className="w-10 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-indigo-500 rounded-full"></div>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-600 to-purple-600 dark:from-white dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Background
              </h2>
              <div className="w-10 h-0.5 bg-gradient-to-l from-transparent via-indigo-500 to-indigo-500 rounded-full"></div>
            </motion.div>
            
            {personalInfo?.aboutText ? (
              <motion.div
                className="text-left space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {personalInfo.aboutText.split('\n').map((paragraph, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -15 : 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.05 * index }}
                  >
                    <p 
                      className="text-sm sm:text-base leading-7 text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ 
                        __html: enhanceTextWithLinks(paragraph) 
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="space-y-4 text-left">
                <motion.p
                  className="text-sm sm:text-base leading-7 text-gray-700 dark:text-gray-300"
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  My background spans{" "}
                  <Link href="#experience" className={highlightStyle}>
                    Aerospace Engineering
                  </Link>
                  {" "}and a{" "}
                  <Link href="#experience" className={highlightStyle}>
                    Master's in Applied Computing
                  </Link>
                  , providing me with a unique blend of{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    technical expertise
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    problem-solving abilities
                  </span>
                  . Leveraging skills in{" "}
                  <Link href="#skills" className={highlightStyle}>
                    software development, cloud computing, and data analytics
                  </Link>
                  , I build and implement solutions that optimize business operations
                  and drive growth.
                </motion.p>
                
                <motion.p
                  className="text-sm sm:text-base leading-7 text-gray-700 dark:text-gray-300"
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  I value{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    collaboration
                  </span>{" "}
                  and am eager to tackle{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    complex challenges
                  </span>
                  , learn new skills, and advance technology.
                </motion.p>
              </div>
            )}

            {/* Bottom Accent - Subtle */}
            <motion.div 
              className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AboutMe;
