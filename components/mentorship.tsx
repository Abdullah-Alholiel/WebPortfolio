import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '@/context/theme-context';
import { usePortfolioData } from '@/context/portfolio-data-context';
import { useSectionInView } from '@/lib/hooks';

interface MentorshipItem {
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  certificateUrl: string;
}

interface MentorshipCardProps extends MentorshipItem {
  size: 'small' | 'medium' | 'large';
  index: number;
}

const MentorshipCard = ({ title, description, icon, imageUrl, certificateUrl, size, index }: MentorshipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { theme } = useTheme();

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

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 md:col-span-2 lg:col-span-2 row-span-1',
    large: 'col-span-1 md:col-span-2 lg:col-span-2 row-span-1 md:row-span-2',
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`${sizeClasses[size]} group relative w-full`}
    >
      <motion.div
        className={`relative h-full rounded-2xl overflow-hidden cursor-pointer ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
            : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
        } shadow-lg hover:shadow-2xl transition-all duration-500`}
        onClick={handleCardClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.3 }}
      >
        {/* Gradient overlay for depth */}
        <div className={`absolute inset-0 bg-gradient-to-br ${
          theme === 'dark' 
            ? 'from-blue-900/20 to-purple-900/20' 
            : 'from-blue-50/50 to-purple-50/50'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        {/* Decorative corner accent */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-blue-600/10 to-purple-600/10' 
            : 'bg-gradient-to-br from-blue-200/30 to-purple-200/30'
        } rounded-bl-full`} />


        {/* Front Side */}
        <motion.div
          className={`relative h-full p-6 flex flex-col ${isFlipped ? 'hidden' : ''}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: isFlipped ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Icon */}
          <div className="absolute top-4 right-4 text-3xl md:text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">
            {icon === "🧠" && <span>🧠</span>}
            {(icon === "🔧" || title.toLowerCase().includes('pepsico')) && <span>💻</span>}
            {icon === "✈️" && <span>✈️</span>}
            {icon === "💻" && <span>💻</span>}
          </div>

          {/* Content based on size */}
          {size === 'large' ? (
            <>
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div
                  className="relative mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image 
                    src={imageUrl} 
                    alt={`${title} logo`} 
                    width={200} 
                    height={200} 
                    className="rounded-full shadow-xl border-4 border-white/20" 
                  />
                </motion.div>
                <h3 className={`text-2xl md:text-3xl font-bold mb-3 text-center ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {title}
                </h3>
                <p className={`text-base md:text-lg text-center leading-relaxed mb-6 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {description}
                </p>
                {/* Certificate Indicator */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gray-700/50 border border-gray-600/50' 
                    : 'bg-gray-100/80 border border-gray-200/50'
                } backdrop-blur-sm`}>
                  <svg className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className={`text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Tap to view certificate
                  </span>
                </div>
              </div>
            </>
          ) : size === 'medium' ? (
            <>
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div
                  className="relative mb-4"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image 
                    src={imageUrl} 
                    alt={`${title} logo`} 
                    width={150} 
                    height={150} 
                    className="rounded-full shadow-lg border-4 border-white/20" 
                  />
                </motion.div>
                <h3 className={`text-xl md:text-2xl font-bold mb-2 text-center ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {title}
                </h3>
                <p className={`text-sm md:text-base text-center mb-4 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {description}
                </p>
                {/* Certificate Indicator */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gray-700/50 border border-gray-600/50' 
                    : 'bg-gray-100/80 border border-gray-200/50'
                } backdrop-blur-sm`}>
                  <svg className={`w-3.5 h-3.5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className={`text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Tap to view certificate
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 flex flex-col justify-center items-center">
                <motion.div
                  className="relative mb-3"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image 
                    src={imageUrl} 
                    alt={`${title} logo`} 
                    width={100} 
                    height={100} 
                    className="rounded-full shadow-md border-2 border-white/20" 
                  />
                </motion.div>
                <h3 className={`text-lg font-bold mb-2 text-center ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {title}
                </h3>
                <p className={`text-xs md:text-sm text-center mb-3 line-clamp-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {description}
                </p>
                {/* Certificate Indicator */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gray-700/50 border border-gray-600/50' 
                    : 'bg-gray-100/80 border border-gray-200/50'
                } backdrop-blur-sm`}>
                  <svg className={`w-3 h-3 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className={`text-[10px] md:text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Tap to view
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Back Side - Certificate */}
        <motion.div
          className={`absolute inset-0 p-4 flex items-center justify-center ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          } ${isFlipped ? '' : 'hidden'}`}
          initial={{ opacity: 0, rotateY: -180 }}
          animate={{ opacity: isFlipped ? 1 : 0, rotateY: isFlipped ? 0 : -180 }}
          transition={{ duration: 0.5 }}
        >
          <Image 
            src={certificateUrl} 
            alt={`${title} certificate`} 
            width={600} 
            height={400} 
            className="object-contain rounded-lg shadow-2xl max-h-full" 
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default function Mentorship() {
  const { ref } = useSectionInView("Mentorship", 0.3);
  const { data, loading: isLoading } = usePortfolioData();
  const mentorship = data.mentorship || [];
  const { theme } = useTheme();

  // Determine card sizes for bento grid layout - optimized for better visual balance
  const getCardSize = (index: number, total: number): 'small' | 'medium' | 'large' => {
    if (total <= 2) return 'large';
    if (total === 3) {
      return index === 0 ? 'large' : 'medium';
    }
    if (total === 4) {
      // First row: 2 large cards, Second row: 2 small cards
      return index < 2 ? 'large' : 'small';
    }
    if (total === 5) {
      // First row: 2 large cards, Second row: 1 medium + 2 small
      if (index < 2) return 'large';
      if (index === 2) return 'medium';
      return 'small';
    }
    if (total === 6) {
      // First row: 2 large cards, Second row: 4 small cards
      return index < 2 ? 'large' : 'small';
    }
    // For 7+ items, create a balanced pattern
    const pattern = ['large', 'large', 'medium', 'small', 'small', 'medium', 'small'];
    return pattern[index % pattern.length] as 'small' | 'medium' | 'large';
  };

  if (isLoading) {
    return (
      <section id="mentorship" ref={ref} className="scroll-mt-28 mb-28 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Mentorship Experiences</h2>
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="mentorship" ref={ref} className="scroll-mt-28 mb-28 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Mentorship Experiences
          </h2>
          <p className={`text-lg md:text-xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Real-world simulations and professional development opportunities
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full" style={{ gridAutoRows: 'minmax(200px, auto)' }}>
          {mentorship.map((item, index) => (
            <MentorshipCard
              key={item.title}
              {...item}
              size={getCardSize(index, mentorship.length)}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}