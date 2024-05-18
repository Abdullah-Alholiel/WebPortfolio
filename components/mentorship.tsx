import React, { useState } from 'react';
import { mentorshipData } from '@/lib/data';
import { motion } from 'framer-motion';
import Image from 'next/image';

const MentorshipCard = ({ title, description, icon, imageUrl, certificateUrl }: typeof mentorshipData[number]) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 hover:bg-gray-50 cursor-pointer relative"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showTooltip && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-sm px-2 py-1 rounded-md">
          Press to show certificate
        </div>
      )}

      {/* Front Side */}
      <motion.div
        className={`absolute top-4 left-4 text-2xl text-blue-500 ${isFlipped ? 'hidden' : ''}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {icon === "🧠" && <span>🧠</span>}
        {icon === "🔧" && <span>🔧</span>}
        {icon === "✈️" && <span>✈️</span>}
        {icon === "💻" && <span>💻</span>}
      </motion.div>
      <motion.div
        className={`flex items-center justify-center mb-4 ${isFlipped ? 'hidden' : ''}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Image src={imageUrl} alt={`${title} logo`} width={180} height={180} className="rounded-full" />
      </motion.div>
      <motion.div
        className={`${isFlipped ? 'hidden' : ''}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="font-semibold text-xl mb-2">{title}</h3>
        <p className="text-gray-600 text-base mb-4">{description}</p>
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

export default function Mentorship() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-10">Mentorship Experiences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mentorshipData.map((mentorship) => (
            <MentorshipCard key={mentorship.title} {...mentorship} />
          ))}
        </div>
      </div>
    </section>
  );
}