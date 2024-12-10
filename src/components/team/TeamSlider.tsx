import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TeamMemberCard } from './TeamMemberCard';

const teamMembers = [
  {
    name: "Ryan Brant",
    title: "CEO",
    experience: "17+ years",
    background: "3x Founder, Agency Veteran",
    image: "https://h3mstudio-web.s3.us-west-1.amazonaws.com/team/team-ryan.png"
  },
  {
    name: "James Tunick",
    title: "President",
    experience: "20+ years",
    background: "Former WaveXR, AR/VR/XR Pioneer",
    image: "https://h3mstudio-web.s3.us-west-1.amazonaws.com/team/team-james.png"
  },
  {
    name: "Jacob Pennock",
    title: "CTO",
    experience: "15+ years",
    background: "Former Meta XR research, Intel Black Belt",
    image: "https://h3mstudio-web.s3.us-west-1.amazonaws.com/team/team-jacob.png"
  },
  {
    name: "Tony Rizzaro",
    title: "Chief Growth & Strategy Officer",
    experience: "30+ Years",
    background: "Pioneer of 1st-to-Market AI Solutions",
    image: "https://h3mstudio-web.s3.us-west-1.amazonaws.com/team/team-tony.png"
  },
  {
    name: "Justin Kasowski, PhD",
    title: "CAIO",
    experience: "8+ years",
    background: "AR/VR/XR/AI Innovator, Former RealmVR",
    image: "https://h3mstudio-web.s3.us-west-1.amazonaws.com/team/team-justin.png"
  },
  {
    name: "Sean Muliro",
    title: "CDO",
    experience: "16+ years",
    background: "Operations Executive, 2 AI Unicorns",
    image: "https://h3mstudio-web.s3.us-west-1.amazonaws.com/team/team-sean.png"
  },
  {
    name: "Alfredo Guenzani",
    title: "ECD - Gameification",
    experience: "10+ years",
    background: "Multidisciplinary Director, Former Virgin Voyages",
    image: "https://h3mstudio-web.s3.us-west-1.amazonaws.com/team/team-alfredo.png"
  },
  {
    name: "Ash Travers",
    title: "ECD - Creative Strategy",
    experience: "10+ years",
    background: "Creative Direction, Agency Veteran",
    image: "https://h3mstudio-web.s3.us-west-1.amazonaws.com/team/team-ash.png"
  }
];

export const TeamSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const cardsPerView = 3;
  const maxIndex = teamMembers.length - cardsPerView;

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < maxIndex) {
      handleNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      handlePrev();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  return (
    <div className="relative max-w-7xl mx-auto px-4">
      <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-start z-10">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`ml-4 p-3 rounded-full bg-white/10 backdrop-blur-sm transition-colors ${
            currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
          }`}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div
        ref={sliderRef}
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="flex gap-6"
          animate={{
            x: currentIndex * -340 // Card width (300) + gap (40)
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              className="flex-shrink-0 w-[300px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TeamMemberCard member={member} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-end z-10">
        <button
          onClick={handleNext}
          disabled={currentIndex >= maxIndex}
          className={`mr-4 p-3 rounded-full bg-white/10 backdrop-blur-sm transition-colors ${
            currentIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
          }`}
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'bg-purple-500 w-8' : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};