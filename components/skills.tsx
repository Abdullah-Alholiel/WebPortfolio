// skills.tsx
import React from "react";
import SectionHeading from "./section-heading";
import { skillsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import { motion } from "framer-motion";

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
      delay: 0.1 * index,
      type: "spring",
      stiffness: 400,
      damping: 20,
      mass: 0.8,
    },
  }),
  whileHover: {
    scale: 2,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
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

export default function Skills() {
  const { ref } = useSectionInView("Skills");

  return (
    <section
      id="skills"
      ref={ref}
      className="mb-20 max-w-[53rem] scroll-mt-20 text-center sm:mb-8"
    >
      <SectionHeading>Skills</SectionHeading>
      <motion.ul 
        className="flex flex-wrap justify-center gap-4 text-sm text-gray-800"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        {skillsData.map((skill, index) => (
          <motion.li
            className="bg-white borderBlack rounded-lg px-4 py-2 dark:bg-white/10 dark:text-white/80 cursor-pointer shadow-md"
            key={index}
            variants={fadeInAnimationVariants}
            custom={index}
            whileHover="whileHover"
            whileTap="whileTap"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
          >
            <motion.span
              className="inline-block"
              whileHover={{ scale: 1.1 }}
            >
              {skill}
            </motion.span>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}