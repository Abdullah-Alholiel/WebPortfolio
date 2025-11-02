"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { links } from "@/lib/data";
import Link from "next/link";
import { useActiveSectionContext } from "@/context/active-section-context";
import { useTheme } from "@/context/theme-context";

export default function Header() {
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Pill-nav colors matching reactbits.dev style with webpage's purple/blue hue
  // Base container: adaptive background (light gray-blue in light mode, dark in dark mode)
  // Inactive pills: transparent with adaptive text color
  // On hover/active: blueish hues matching webpage theme
  //   - Light mode: white text on off-white blueish pill, dark blue-gray text on light base when inactive
  //   - Dark mode: white text on grey dark bluish pill, white text on dark base when inactive
  const baseColor = theme === "dark" ? "#060010" : "#f5f4f8"; // Dark background in dark mode, very light blue-gray in light mode
  const pillBgColor = theme === "dark" ? "#4a5568" : "#b8b0d9"; // Grey dark bluish in dark mode, darker off-white blueish purple (better contrast) in light mode
  const inactiveTextColor = theme === "dark" ? "#ffffff" : "#3d3551"; // White text in dark mode, dark blue-gray text in light mode
  // Text color on pill: white in both modes for contrast against colored pills
  const activeTextColor = theme === "dark" ? "#ffffff" : "#ffffff"; // White in both modes for contrast
  const hoverTextColor = theme === "dark" ? "#ffffff" : "#ffffff"; // White in both modes for contrast

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="z-[999] relative">
      {/* Pill Navigation Container - Dark base like reactbits.dev */}
      <motion.div
        className="fixed top-0 left-1/2 h-[4.5rem] w-full rounded-none sm:top-6 sm:h-[3.25rem] sm:w-auto sm:min-w-[42rem] sm:max-w-[95vw] sm:rounded-full shadow-lg flex items-center justify-center"
        initial={{ y: -100, x: "-50%", opacity: 0 }}
        animate={{ y: 0, x: "-50%", opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 30,
        }}
        style={{
          backgroundColor: baseColor,
          border: theme === "light" ? "1px solid rgba(0, 0, 0, 0.1)" : "none",
        }}
      >
        {/* Desktop Navigation - All items styled as pills with animations */}
        <nav className="hidden sm:flex h-[2.625rem] py-0 px-[3px] items-center overflow-hidden">
          <ul className="flex items-center gap-[3px] h-full">
            {links.map((link, index) => {
              const isActive = activeSection === link.name;
              const isHovered = hoveredIndex === index;
              const showPill = isActive || isHovered;

              return (
                <motion.li
                  key={link.hash}
                  className="relative h-full flex items-center shrink-0"
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: index * 0.05,
                  }}
                >
                  <Link
                    href={link.hash}
                    className="relative flex items-center justify-center px-3 py-0 h-full rounded-full font-semibold text-xs sm:text-sm uppercase tracking-[0.2px] whitespace-nowrap overflow-hidden"
                    style={{
                      backgroundColor: showPill ? pillBgColor : "transparent",
                      minWidth: "fit-content",
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => {
                      setActiveSection(link.name);
                      setTimeOfLastClick(Date.now());
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {/* Hover circle animation (like reactbits.dev) */}
                    {!isActive && (
                      <motion.span
                        className="absolute left-1/2 bottom-0 rounded-full pointer-events-none z-0"
                        style={{
                          backgroundColor: pillBgColor,
                          width: "200px",
                          height: "200px",
                          transform: "translateX(-50%) translateY(50%)",
                          transformOrigin: "50% 50%",
                        }}
                        initial={{ scale: 0 }}
                        animate={{
                          scale: isHovered ? 1.2 : 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                          duration: 0.3,
                        }}
                      />
                    )}

                    {/* Active pill background */}
                    {isActive && (
                      <motion.span
                        className="absolute inset-0 rounded-full"
                        style={{
                          backgroundColor: pillBgColor,
                        }}
                        layoutId="activePill"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Text label stack for animation */}
                    <span className="relative z-10 flex items-center justify-center h-full w-full overflow-hidden">
                      {/* Regular text (white on dark base, moves out on hover) */}
                      {!isActive && (
                        <motion.span
                          className="flex items-center justify-center h-full w-full"
                          animate={{
                            y: isHovered ? -40 : 0,
                            opacity: isHovered ? 0 : 1,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            duration: 0.3,
                          }}
                          style={{
                            color: inactiveTextColor,
                          }}
                        >
                          {link.name}
                        </motion.span>
                      )}
                      {/* Hover text (black in light mode, white in dark mode, moves in on hover) */}
                      {!isActive && (
                        <motion.span
                          className="absolute left-0 top-0 flex items-center justify-center h-full w-full"
                          animate={{
                            y: isHovered ? 0 : 40,
                            opacity: isHovered ? 1 : 0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            duration: 0.3,
                          }}
                          style={{
                            color: hoverTextColor,
                          }}
                        >
                          {link.name}
                        </motion.span>
                      )}
                      {/* Active text (always visible when active) */}
                      {isActive && (
                        <span
                          style={{
                            color: activeTextColor,
                          }}
                        >
                          {link.name}
                        </span>
                      )}
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="sm:hidden fixed top-[0.15rem] right-4 h-12 w-12 rounded-full flex flex-col items-center justify-center gap-1.5 z-50"
          style={{
            backgroundColor: pillBgColor,
          }}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <motion.span
            className="w-5 h-0.5 rounded-full"
            style={{
              backgroundColor: activeTextColor,
            }}
            animate={{
              rotate: isMobileMenuOpen ? 45 : 0,
              y: isMobileMenuOpen ? 6 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-5 h-0.5 rounded-full"
            style={{
              backgroundColor: activeTextColor,
            }}
            animate={{
              rotate: isMobileMenuOpen ? -45 : 0,
              y: isMobileMenuOpen ? -6 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        </button>

        {/* Mobile Navigation Links */}
        <nav className="sm:hidden flex fixed top-[0.15rem] left-1/2 h-12 -translate-x-1/2 py-2">
          <ul className="flex w-[22rem] flex-wrap items-center justify-center gap-y-1 text-[0.9rem] font-medium">
            {links.slice(0, 4).map((link) => {
              const isActive = activeSection === link.name;
              return (
                <motion.li
                  key={link.hash}
                  className="h-3/4 flex items-center justify-center relative"
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <Link
                    href={link.hash}
                    className="flex w-full items-center justify-center px-3 py-3 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? pillBgColor : "transparent",
                      color: isActive ? activeTextColor : inactiveTextColor,
                    }}
                    onClick={() => {
                      setActiveSection(link.name);
                      setTimeOfLastClick(Date.now());
                    }}
                  >
                    {link.name}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>
      </motion.div>

      {/* Mobile Menu Popover */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="sm:hidden fixed top-[4.5rem] left-4 right-4 z-[998] rounded-3xl shadow-2xl backdrop-blur-xl"
            style={{
              backgroundColor: baseColor,
            }}
            initial={{ opacity: 0, y: -20, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -20, scaleY: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="flex flex-col gap-[3px] p-[3px]">
              {links.map((link) => {
                const isActive = activeSection === link.name;
                return (
                  <li key={link.hash}>
                    <Link
                      href={link.hash}
                      className="block px-4 py-3 rounded-full text-base font-semibold uppercase tracking-[0.2px] transition-all duration-200"
                      style={{
                        backgroundColor: isActive ? pillBgColor : "transparent",
                        color: isActive ? activeTextColor : inactiveTextColor,
                      }}
                      onClick={() => {
                        setActiveSection(link.name);
                        setTimeOfLastClick(Date.now());
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


