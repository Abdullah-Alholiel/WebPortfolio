import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '@/context/theme-context';
import { usePortfolioData } from '@/context/portfolio-data-context';
import { useSectionInView } from '@/lib/hooks';
import { resolveImageUrl } from '@/lib/image-utils';
import Loader from '@/components/ui/loader';

interface MentorshipItem {
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  certificateUrl: string;
  fallbackImageUrl?: string;
  fallbackCertificateUrl?: string;
}

interface MentorshipCardProps extends MentorshipItem {
  size: 'small' | 'medium' | 'large';
  index: number;
}

const MentorshipCard = ({ title, description, icon, imageUrl, fallbackImageUrl, certificateUrl, fallbackCertificateUrl, size, index }: MentorshipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [imageFallbackUsed, setImageFallbackUsed] = useState(false);
  const [certificateFallbackUsed, setCertificateFallbackUsed] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(() => {
    const resolved = resolveImageUrl({ url: imageUrl, fallback: fallbackImageUrl });
    return resolved ?? '/favicon.ico';
  });
  const [currentCertificateSrc, setCurrentCertificateSrc] = useState<string>(() => {
    const resolved = resolveImageUrl({ url: certificateUrl, fallback: fallbackCertificateUrl });
    return resolved ?? '/favicon.ico';
  });
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

  useEffect(() => {
    const resolvedImage = resolveImageUrl({ url: imageUrl, fallback: fallbackImageUrl });
    setCurrentImageSrc(resolvedImage ?? '/favicon.ico');
    setImageFallbackUsed(false);

    const resolvedCertificate = resolveImageUrl({ url: certificateUrl, fallback: fallbackCertificateUrl });
    setCurrentCertificateSrc(resolvedCertificate ?? '/favicon.ico');
    setCertificateFallbackUsed(false);
  }, [imageUrl, certificateUrl, fallbackImageUrl, fallbackCertificateUrl]);

  const fallbackImageSrc = resolveImageUrl({ url: fallbackImageUrl }) ?? '/favicon.ico';
  const fallbackCertificateSrc = resolveImageUrl({ url: fallbackCertificateUrl }) ?? '/favicon.ico';

  const handleImageError = () => {
    if (!imageFallbackUsed && fallbackImageSrc !== currentImageSrc) {
      setImageFallbackUsed(true);
      setCurrentImageSrc(fallbackImageSrc);
    }
  };

  const handleCertificateError = () => {
    if (!certificateFallbackUsed && fallbackCertificateSrc !== currentCertificateSrc) {
      setCertificateFallbackUsed(true);
      setCurrentCertificateSrc(fallbackCertificateSrc);
    }
  };

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 md:col-span-2 lg:col-span-2 row-span-1',
    large: 'col-span-1 md:col-span-2 lg:col-span-2 row-span-1 md:row-span-2',
  };

  // Fixed heights per card size to prevent layout shift on flip.
  // Non-large cards share ONE height so mixed-size rows keep aligned bottoms.
  // `h-` (not `min-h-` only) is kept here deliberately: the bento grid spans
  // rows explicitly, so the tile must fill its track; the INNER content is what
  // is clamped (card-title/card-desc), so text can never overlap the footer.
  const sizeHeights: Record<string, string> = {
    small: 'min-h-[320px] h-[320px]',
    medium: 'min-h-[320px] h-[320px]',
    large: 'min-h-[420px] h-[420px] md:min-h-[480px] md:h-[480px]',
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
      className={`${sizeClasses[size]} group relative w-full ${sizeHeights[size]}`}
    >
      <motion.div
        className={`relative h-full rounded-2xl overflow-hidden cursor-pointer ${theme === 'dark'
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
        <div className={`absolute inset-0 bg-gradient-to-br ${theme === 'dark'
          ? 'from-blue-900/20 to-purple-900/20'
          : 'from-blue-50/50 to-purple-50/50'
          } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        {/* Decorative corner accent */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${theme === 'dark'
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

          {/* Content based on size.
                  Every size shares ONE vertical alignment contract:
                  icon → title → description → certificate, all centred, with
                  a fixed gap scale and a clamped title/description. Previously
                  each size had its own mb-* values and only the smallest card
                  clamped its text, which is why the "British Airways" card did
                  not line up with its neighbours. */}
              {size === 'large' ? (
            <>
              <div className="card-body items-center justify-center text-center">
                <motion.div
                  className="relative mb-5 shrink-0"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={currentImageSrc}
                    alt={`${title} logo`}
                    width={160}
                    height={160}
                    className="rounded-full shadow-xl border-4 border-white/20 w-32 h-32 md:w-40 md:h-40 object-cover"
                    onError={handleImageError}
                  />
                </motion.div>
                <h3 className={`card-title text-xl md:text-2xl text-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}
                  style={{ ['--card-title-lines' as string]: '2' }}
                >
                  {title}
                </h3>
                <p className={`card-desc text-sm md:text-base text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  style={{ ['--card-desc-lines' as string]: '3' }}
                >
                  {description}
                </p>
              </div>
              {/* Certificate indicator — consistent row, pinned below the body */}
              <div className="mt-4 flex justify-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${theme === 'dark'
                  ? 'bg-gray-700/50 border border-gray-600/50'
                  : 'bg-gray-100/80 border border-gray-200/50'
                  } backdrop-blur-sm`}>
                  <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                    Tap to view certificate
                  </span>
                </div>
              </div>
            </>
          ) : size === 'medium' ? (
            <>
              <div className="card-body items-center justify-center text-center">
                <motion.div
                  className="relative mb-4 shrink-0"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={currentImageSrc}
                    alt={`${title} logo`}
                    width={120}
                    height={120}
                    className="rounded-full shadow-lg border-4 border-white/20 w-24 h-24 md:w-28 md:h-28 object-cover"
                    onError={handleImageError}
                  />
                </motion.div>
                <h3 className={`card-title text-lg md:text-xl text-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}
                  style={{ ['--card-title-lines' as string]: '2' }}
                >
                  {title}
                </h3>
                <p className={`card-desc text-sm text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  style={{ ['--card-desc-lines' as string]: '2' }}
                >
                  {description}
                </p>
              </div>
              <div className="mt-4 flex justify-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${theme === 'dark'
                  ? 'bg-gray-700/50 border border-gray-600/50'
                  : 'bg-gray-100/80 border border-gray-200/50'
                  } backdrop-blur-sm`}>
                  <svg className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                    Tap to view certificate
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="card-body items-center justify-center text-center">
                <motion.div
                  className="relative mb-3 shrink-0"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={currentImageSrc}
                    alt={`${title} logo`}
                    width={96}
                    height={96}
                    className="rounded-full shadow-md border-2 border-white/20 w-20 h-20 md:w-24 md:h-24 object-cover"
                    onError={handleImageError}
                  />
                </motion.div>
                <h3 className={`card-title text-base md:text-lg text-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}
                  style={{ ['--card-title-lines' as string]: '2' }}
                >
                  {title}
                </h3>
                <p className={`card-desc text-xs md:text-sm text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  style={{ ['--card-desc-lines' as string]: '3' }}
                >
                  {description}
                </p>
              </div>
                {/* Certificate Indicator */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${theme === 'dark'
                  ? 'bg-gray-700/50 border border-gray-600/50'
                  : 'bg-gray-100/80 border border-gray-200/50'
                  } backdrop-blur-sm`}>
                  <svg className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className={`text-[10px] md:text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                    Tap to view
                  </span>
                </div>
            </>
          )}
        </motion.div>

        {/* Back Side - Certificate */}
        <motion.div
          className={`absolute inset-0 p-6 flex items-center justify-center rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-900/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'
            } ${isFlipped ? '' : 'hidden'}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isFlipped ? 1 : 0, scale: isFlipped ? 1 : 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle overlay gradient */}
          <div className={`absolute inset-0 ${theme === 'dark'
            ? 'bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10'
            : 'bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30'
            }`} />
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={currentCertificateSrc}
              alt={`${title} certificate`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain rounded-lg drop-shadow-lg"
              onError={handleCertificateError}
            />
          </div>
          {/* Tap to close hint */}
          <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium ${theme === 'dark'
            ? 'bg-gray-800/60 text-gray-400 border border-gray-700/50'
            : 'bg-gray-100/60 text-gray-500 border border-gray-200/50'
            } backdrop-blur-sm`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Tap to close
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default function Mentorship() {
  const { ref } = useSectionInView("Mentorship", 0.3);
  const { data, loading: isLoading } = usePortfolioData();
  const mentorship = data?.mentorship || [];
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
          <Loader className="w-full justify-center" label="Loading mentorship experiences" />
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
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
            Mentorship Experiences
          </h2>
          <p className={`text-lg md:text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Real-world simulations and professional development opportunities
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
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