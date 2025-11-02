// Achievements.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '@/context/theme-context';
import { usePortfolioData } from '@/context/portfolio-data-context';
import { useSectionInView } from '@/lib/hooks';
import StandardIcon from './standard-icon';

interface Achievement {
  title: string;
  description: string;
  Icon?: string | any; // Can be string (icon name) or React component (for backward compatibility)
  certificateUrl: string;
}

const AchievementCard = ({ title, description, Icon, certificateUrl }: Achievement) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { theme } = useTheme(); // Use the theme context

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isFlipped) {
      timeout = setTimeout(() => {
        setIsFlipped(false);
      }, 4000);
    }
    return () => clearTimeout(timeout);
  }, [isFlipped]);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <motion.div
      className={`rounded-lg p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-transparent'} shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer`}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleCardClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Front Side */}
      <motion.div
        className={`flex flex-col items-center space-y-6 ${isFlipped ? 'hidden' : ''}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {Icon && (
          <StandardIcon 
            icon={Icon} 
            variant="card"
            className="group-hover:rotate-12"
          />
        )}
        <div className="text-center">
          <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-2`}>{title}</h3>
          <p className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
        </div>
        {showTooltip && (
          <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-800'} text-white text-sm px-2 py-1 rounded-md`}>
            Click to show Certificate
          </div>
        )}
      </motion.div>

      {/* Back Side */}
      <motion.div
        className={`${isFlipped ? '' : 'hidden'}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Image src={certificateUrl} alt={`${title} certificate`} width={600} height={400} className="object-contain" />
      </motion.div>
    </motion.div>
  );
};

export default function Achievements() {
  const { ref } = useSectionInView("Achievements", 0.3);
  const { data, loading: isLoading } = usePortfolioData();
  const achievements = data.achievements || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? achievements.length - 2 : prevIndex - 2));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex >= achievements.length - 2 ? 0 : prevIndex + 2));
  };

  const cardVariants = {
    initial: { opacity: 0, x: '-100%' },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' },
  };

  return (
    <section id="achievements" ref={ref} className="scroll-mt-28 mb-28 py-12 px-5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8">Achievements</h2>
        <div className="relative">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            key={`${achievements[currentIndex]?.title}-${achievements[currentIndex + 1]?.title}`}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            {!isLoading && achievements[currentIndex] && (
              <>
                <AchievementCard {...achievements[currentIndex]} />
                {achievements[currentIndex + 1] && (
                  <AchievementCard {...achievements[currentIndex + 1]} />
                )}
              </>
            )}
          </motion.div>
          <button
            className="absolute top-1/2 -left-12 transform -translate-y-1/2 px-4 py-2 rounded-full focus:outline-none text-2xl transition-colors duration-300"
            onClick={goToPrevious}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 hover:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute top-1/2 -right-12 transform -translate-y-1/2 px-4 py-2 rounded-full focus:outline-none text-2xl transition-colors duration-300"
            onClick={goToNext}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 hover:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}