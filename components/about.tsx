// About.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/theme-context'; // Import useTheme to access the current theme

const AboutMe = () => {
  const { theme } = useTheme(); // Use the theme context
  const containerVariants = {
    initial: { opacity: 0, y: 50 },
    animate: {
      opacity: 1,
      y: 0,
<<<<<<< HEAD
      transition: { delay: 0, duration: 0 }
=======
      transition: { delay: 0, duration: 0 } // Instant animation
>>>>>>> 5b5348e7bf41392ee88a37ffc4fcbf4a6fe96929
    }
  };

  const highlightStyle = `text-indigo-600 ${theme === 'dark' ? 'dark:text-indigo-400' : ''} font-semibold`;

  return (
    <motion.section
      className={`py-10 px-6 `}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className={`max-w-4xl mx-auto rounded-xl p-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        <motion.h1
          className="text-4xl font-bold mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
<<<<<<< HEAD
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0 }}
=======
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0 }} // Instant animation
>>>>>>> 5b5348e7bf41392ee88a37ffc4fcbf4a6fe96929
        >
          About Me
        </motion.h1>
        <motion.p
          className="text-lg leading-relaxed"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
<<<<<<< HEAD
          transition={{ delay: 0, duration: 0 }}
=======
          transition={{ delay: 0, duration: 0 }} // Instant animation
>>>>>>> 5b5348e7bf41392ee88a37ffc4fcbf4a6fe96929
        >
          I'm <span className={highlightStyle}>Abdullah Alholaiel</span>, an <span className={highlightStyle}>innovative Digital Strategist, Consultant and System Developer</span> with a proven track record in leading digital transformation projects, enhancing operational efficiency, and driving revenue growth across diverse sectors. My background spans <span className={highlightStyle}>Aerospace Engineering and a Master's in Applied Computing</span>, providing me with a unique blend of technical expertise and problem-solving abilities.
        </motion.p>
        <motion.p
          className="text-lg leading-relaxed mt-4"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
<<<<<<< HEAD
          transition={{ delay: 0, duration: 0 }}
=======
          transition={{ delay: 0, duration: 0 }} // Instant animation
>>>>>>> 5b5348e7bf41392ee88a37ffc4fcbf4a6fe96929
        >
          Leveraging skills in <span className={highlightStyle}>software development, cloud computing, and data analytics</span>, I build and implement solutions that optimize business operations and drive growth. I value collaboration and am eager to tackle complex challenges, learn new skills, and advance technology.
        </motion.p>
      </div>
    </motion.section>
  );
};

export default AboutMe;
