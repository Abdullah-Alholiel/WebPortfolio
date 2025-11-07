import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '@/context/theme-context';
import { usePortfolioData } from '@/context/portfolio-data-context';
import { useSectionInView } from '@/lib/hooks';
import StandardIcon from './standard-icon';
import Loader from '@/components/ui/loader';
import { resolveImageUrl } from '@/lib/image-utils';

interface Achievement {
  title: string;
  description: string;
  Icon?: string | any;
  certificateUrl?: string;
  fallbackCertificateUrl?: string;
}

const AchievementCard = ({ title, description, Icon, certificateUrl, fallbackCertificateUrl, index }: Achievement & { index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isFlipped) {
      timeout = setTimeout(() => {
        setIsFlipped(false);
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [isFlipped]);

  return (
    <motion.div
      className="group relative h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div
        className={`relative h-full rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800'
            : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg'
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="p-6 md:p-8 h-full flex flex-col"
            >
              {/* Icon */}
              {Icon && (
                <div className="mb-6">
                  <div className={`inline-flex p-3 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-blue-500/10 text-blue-400' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <StandardIcon 
                      icon={Icon} 
                      variant="card"
                      className="text-2xl"
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1">
                <h3 className={`text-xl font-semibold mb-3 leading-tight ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {description}
                </p>
              </div>

              {/* Footer */}
              <div className={`mt-6 pt-4 border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className={`flex items-center gap-2 text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  <span>View Certificate</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`h-full p-4 flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
              }`}
            >
              <Image 
                src={
                  resolveImageUrl({
                    url: certificateUrl,
                    fallback: fallbackCertificateUrl ?? certificateUrl ?? undefined,
                  }) || '/favicon.ico'
                }
                alt={`${title} certificate`} 
                width={600} 
                height={400} 
                className="object-contain max-h-full max-w-full rounded-lg" 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function Achievements() {
  const { ref } = useSectionInView("Achievements", 0.3);
  const { data, loading: isLoading } = usePortfolioData();
  const achievements = data.achievements || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useTheme();

  const itemsPerView = 3;
  const totalPages = Math.ceil(achievements.length / itemsPerView);
  const currentPage = Math.floor(currentIndex / itemsPerView);

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev - itemsPerView;
      return newIndex < 0 ? Math.max(0, (totalPages - 1) * itemsPerView) : newIndex;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev + itemsPerView;
      return newIndex >= achievements.length ? 0 : newIndex;
    });
  };

  const goToPage = (pageIndex: number) => {
    setCurrentIndex(pageIndex * itemsPerView);
  };

  const visibleAchievements = achievements.slice(currentIndex, currentIndex + itemsPerView);

  if (isLoading) {
    return (
      <section id="achievements" ref={ref} className="scroll-mt-28 mb-28 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Achievements</h2>
          <Loader className="w-full justify-center" label="Loading achievements" />
        </div>
      </section>
    );
  }

  return (
    <section id="achievements" ref={ref} className="scroll-mt-28 mb-28 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Achievements
          </h2>
          <p className={`text-base md:text-lg ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Professional certifications and accomplishments
          </p>
        </motion.div>

        {/* Carousel */}
        {achievements.length > 0 && (
          <div className="relative">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <AnimatePresence mode="wait">
                {visibleAchievements.map((achievement, idx) => (
                  <AchievementCard
                    key={`${achievement.title}-${currentIndex + idx}`}
                    {...achievement}
                    index={idx}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            {achievements.length > itemsPerView && (
              <>
                {/* Arrows */}
                <button
                  onClick={goToPrevious}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 hidden lg:flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300'
                      : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm'
                  }`}
                  aria-label="Previous achievements"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 hidden lg:flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300'
                      : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm'
                  }`}
                  aria-label="Next achievements"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Pagination Dots */}
                <div className="flex justify-center items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToPage(index)}
                      className="focus:outline-none"
                      aria-label={`Go to page ${index + 1}`}
                    >
                      <motion.div
                        className={`rounded-full transition-all ${
                          currentPage === index
                            ? theme === 'dark'
                              ? 'bg-blue-500'
                              : 'bg-blue-600'
                            : theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        initial={false}
                        animate={{
                          width: currentPage === index ? 24 : 8,
                          height: 8,
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
