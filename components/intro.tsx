'use client';

import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BsArrowRight, BsLinkedin } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import { FaGithubSquare } from "react-icons/fa";
import { useSectionInView } from "@/lib/hooks";
import { useActiveSectionContext } from "@/context/active-section-context";
import { usePortfolioData } from "@/context/portfolio-data-context";

interface PersonalInfo {
  cvLink: string;
  introText: string;
  aboutText: string;
  contactEmail: string;
  linkedInUrl: string;
  githubUrl: string;
}

// Helper function to parse intro text into structured parts
function parseIntroText(text: string): string[] {
  // If text has newlines, split and return (but normalize them)
  if (text.includes('\n')) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    // If already properly formatted, return as-is
    if (lines.length >= 3) {
      return lines;
    }
  }
  
  // If no newlines or improperly formatted, parse intelligently
  // Pattern: "Hey/Heya, I'm [Name]. [Role description] with a proven..."
  const greetingMatch = text.match(/^(Heya?)[,]\s*I'm\s+([^.]+)\./i);
  if (greetingMatch) {
    const greeting = `${greetingMatch[1]}, I'm ${greetingMatch[2]}.`;
    const remaining = text.substring(greetingMatch[0].length).trim();
    
    // Split at "with a proven" to separate role from description
    const withMatch = remaining.match(/^(.*?)\s+(with\s+a\s+proven.*)$/i);
    if (withMatch) {
      const role = withMatch[1].trim();
      const description = withMatch[2].trim();
      
      // Split role at the LAST comma for proper formatting
      // e.g., "an innovative Data & Digital Strategist, Consultant and System Developer"
      // Should become: "an innovative Data & Digital Strategist," and "Consultant and System Developer"
      const lastCommaIndex = role.lastIndexOf(',');
      if (lastCommaIndex > 0) {
        const rolePart1 = role.substring(0, lastCommaIndex + 1).trim();
        const rolePart2 = role.substring(lastCommaIndex + 1).trim();
        return [greeting, rolePart1, rolePart2, description];
      }
      
      // If no comma, try splitting at "and"
      const andIndex = role.indexOf(' and ');
      if (andIndex > 0) {
        const rolePart1 = role.substring(0, andIndex);
        const rolePart2 = 'and' + role.substring(andIndex + 4);
        return [greeting, rolePart1, rolePart2, description];
      }
      
      return [greeting, role, description];
    }
    
    // If no "with a proven" pattern, return greeting and remaining text
    return [greeting, remaining];
  }
  
  // Fallback: return as single line
  return [text];
}

export default function Intro() {
  const { ref } = useSectionInView("Home", 0.3);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();
  const { data } = usePortfolioData();
  const personalInfo = data.personal as PersonalInfo | null;
  const [isProfileHovered, setIsProfileHovered] = useState(false);

  return (
    <section
      ref={ref}
      id="home"
      className="mb-16 max-w-[50rem] text-center scroll-mt-[100rem] relative"
    >
      {/* Decorative Background Elements - Subtle */}
      <div className="absolute top-20 left-0 w-64 h-64 bg-indigo-200 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-15 animate-blob"></div>
      <div className="absolute top-32 right-0 w-64 h-64 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
      
      <div className="relative z-10">
        {/* Profile Image with Enhanced Effects */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 125,
                duration: 0.3,
              }}
              onHoverStart={() => setIsProfileHovered(true)}
              onHoverEnd={() => setIsProfileHovered(false)}
              className="relative"
            >
              {/* Subtle Glowing Ring Effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50 blur-lg animate-pulse"></div>
              
              <Image
                src="/abdullah.jpg"
                alt="Abdullah Alholaiel"
                width="384"
                height="384"
                quality="95"
                priority={true}
                className="relative h-40 w-40 sm:h-48 sm:w-48 rounded-full object-cover border-[0.35rem] border-white dark:border-gray-800 shadow-xl transition-all duration-300"
                style={{
                  transform: isProfileHovered ? 'scale(1.02)' : 'scale(1)',
                }}
              />
            </motion.div>

            <motion.span
              className="absolute -bottom-1 -right-1 text-5xl sm:text-6xl drop-shadow-lg"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 125,
                delay: 0.15,
                duration: 0.7,
              }}
            >
              🇸🇦
            </motion.span>
          </div>
        </div>

        {/* Text Content with Better Hierarchy and Spacing */}
        <motion.div
          className="px-4 space-y-4 sm:space-y-5 mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {(() => {
            // Get intro text - either from API or use fallback
            const introText = personalInfo?.introText || null;
            
            // Parse the text into structured parts
            let parsedLines: string[] = [];
            if (introText && typeof introText === 'string') {
              parsedLines = parseIntroText(introText);
            } else {
              // Use fallback structure with proper formatting
              parsedLines = [
                "Hey, I'm Abdullah Alholaiel.",
                "an innovative Data & Digital Strategist,",
                "Consultant and System Developer",
                "with a proven track record in leading digital transformation projects, enhancing operational efficiency, and driving revenue growth across diverse sectors."
              ];
            }
            
            // Render parsed lines with varied sizes and beautiful animations
            return parsedLines.map((line, i) => {
              const delay = i * 0.15; // Subtle staggered animation delay
              
              if (i === 0) {
                // First line - Greeting (Largest, Bold, with typing animation effect)
                const nameMatch = line.match(/(.*?)(Abdullah\s+Alholaiel)(.*)/i);
                return (
                  <motion.h1 
                    key={i} 
                    className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-[1.15] tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay, duration: 0.6, ease: "easeOut" }}
                  >
                    {nameMatch ? (
                      <>
                        <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">{nameMatch[1]}</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{nameMatch[2]}</span>
                        <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">{nameMatch[3]}</span>
                      </>
                    ) : (
                      <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">{line}</span>
                    )}
                  </motion.h1>
                );
              } else if (i === 1) {
                // Second line - Role part 1 (Medium-large size)
                return (
                  <motion.h2 
                    key={i} 
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 leading-relaxed sm:leading-loose tracking-wide"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay, duration: 0.5, ease: "easeOut" }}
                  >
                    {line}
                  </motion.h2>
                );
              } else if (i === 2) {
                // Third line - Role part 2 (Medium size)
                return (
                  <motion.h2 
                    key={i} 
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 leading-relaxed sm:leading-loose tracking-wide"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay, duration: 0.5, ease: "easeOut" }}
                  >
                    {line}
                  </motion.h2>
                );
              } else {
                // Additional lines - Description (Smaller size, subdued color)
                return (
                  <motion.p 
                    key={i} 
                    className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 font-normal leading-relaxed sm:leading-loose max-w-2xl mx-auto mt-2 sm:mt-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay, duration: 0.5, ease: "easeOut" }}
                  >
                    {line}
                  </motion.p>
                );
              }
            });
          })()}
        </motion.div>

        {/* CTA Buttons with Consistent Spacing */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4 text-sm sm:text-base font-medium"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Primary CTA - Gradient with Glow */}
          <Link
            href="#contact"
            className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 sm:px-7 sm:py-3.5 flex items-center gap-2 rounded-full outline-none focus:scale-105 hover:scale-105 active:scale-100 transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 dark:shadow-indigo-900/50"
            onClick={() => {
              setActiveSection("Contact");
              setTimeOfLastClick(Date.now());
            }}
          >
            <span className="whitespace-nowrap">Contact me here</span>
            <BsArrowRight className="opacity-80 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
          </Link>

          {/* Secondary CTA */}
          <a
            href={personalInfo?.cvLink || "https://drive.google.com/file/d/1eD9Z4_MewaOIhF9E1CceTKgTWHmKKe9x/view?usp=sharing"}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white dark:bg-white/10 px-6 py-3 sm:px-7 sm:py-3.5 flex items-center gap-2 rounded-full outline-none focus:scale-105 hover:scale-105 hover:bg-gray-50 dark:hover:bg-white/20 active:scale-100 transition-all duration-300 cursor-pointer borderBlack shadow-md hover:shadow-lg dark:text-white/90"
          >
            <span className="whitespace-nowrap">View CV</span>
            <HiDownload className="opacity-70 group-hover:translate-y-1 group-hover:opacity-100 transition-all" />
          </a>

          {/* Social Icons with Tooltips */}
          <div className="relative group/linkedin">
            <a
              className="bg-white dark:bg-white/10 p-3 sm:p-3.5 text-gray-700 dark:text-white/70 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center rounded-full focus:scale-110 hover:scale-110 active:scale-105 transition-all duration-300 cursor-pointer borderBlack shadow-md hover:shadow-lg w-12 h-12"
              href={personalInfo?.linkedInUrl || "https://www.linkedin.com/in/abdullah-alholaiel-74208a210/"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
            >
              <BsLinkedin className="text-lg sm:text-xl" />
            </a>
            <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-1 px-3 opacity-0 group-hover/linkedin:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
              LinkedIn
            </span>
          </div>

          <div className="relative group/github">
            <a
              className="bg-white dark:bg-white/10 p-3 sm:p-3.5 text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white flex items-center justify-center text-lg sm:text-xl rounded-full focus:scale-110 hover:scale-110 active:scale-105 transition-all duration-300 cursor-pointer borderBlack shadow-md hover:shadow-lg w-12 h-12"
              href={personalInfo?.githubUrl || "https://www.github.com/Abdullah-Alholiel"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
            >
              <FaGithubSquare />
            </a>
            <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-1 px-3 opacity-0 group-hover/github:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
              GitHub
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}