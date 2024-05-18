// About.tsx

import React from 'react';
import { motion } from 'framer-motion';

const AboutMe = () => {
  const containerVariants = {
    initial: { opacity: 0, y: 50 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { delay: 4, duration: 1.5 }
    }
  };

  const highlightStyle = "text-indigo-600 dark:text-indigo-400 font-semibold";

  return (
    <motion.section
      className="py-10 px-5 text-gray-800 dark:text-gray-200"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-4xl mx-auto rounded-xl p-10  bg-white shadow-lg text-center">
        <motion.h1
          className="text-4xl font-bold mb-6"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 4 }}
        >
          About Me
        </motion.h1>
        <motion.p
          className="text-lg leading-relaxed"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 4.5, duration: 0.7 }}
        >
          I'm <span className={highlightStyle}>Abdullah Alholaiel</span>, an <span className={highlightStyle}>innovative Digital Strategist, Consultant and System Developer</span> with a proven track record in leading digital transformation projects, enhancing operational efficiency, and driving revenue growth across diverse sectors. My background spans <span className={highlightStyle}>Aerospace Engineering and a Master's in Applied Computing</span>, providing me with a unique blend of technical expertise and problem-solving abilities.
        </motion.p>
        <motion.p
          className="text-lg leading-relaxed mt-4"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 4.7, duration: 0.7 }}
        >
          Leveraging skills in <span className={highlightStyle}>software development, cloud computing, and data analytics</span>, I build and implement solutions that optimize business operations and drive growth. I value collaboration and am eager to tackle complex challenges, learn new skills, and advance technology.
        </motion.p>
      </div>
    </motion.section>
  );
};

export default AboutMe;
