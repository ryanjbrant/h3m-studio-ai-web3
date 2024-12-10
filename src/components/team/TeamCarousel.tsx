import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TeamMemberCard } from './TeamMemberCard';
import { useSwipe } from '../../hooks/useSwipe';

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

export const TeamCarousel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const newIndex = direction === 'left' 
        ? Math.max(0, currentIndex - 1)
        : Math.min(teamMembers.length - 3, currentIndex + 1);
      
      setCurrentIndex(newIndex);
      const scrollAmount = newIndex * 320; // Card width + gap
      containerRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const swipeHandlers = useSwipe(
    () => scroll('right'),
    () => scroll('left')
  );

  return (
    <div className="relative max-w-7xl mx-auto px-4">
      <div className="absolute inset-y-0 left-0 w-32 flex items-center justify-start z-10">
        <button
          onClick={() => scroll('left')}
          disabled={currentIndex === 0}
          className={`ml-4 p-3 rounded-full bg-white/10 backdrop-blur-sm transition-colors ${
            currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      
      <motion.div 
        ref={containerRef}
        className="flex gap-6 overflow-x-hidden scroll-smooth"
        {...swipeHandlers}
      >
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            className="flex-shrink-0 w-[300px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <TeamMemberCard member={member} index={index} />
          </motion.div>
        ))}
      </motion.div>

      <div className="absolute inset-y-0 right-0 w-32 flex items-center justify-end z-10">
        <button
          onClick={() => scroll('right')}
          disabled={currentIndex >= teamMembers.length - 3}
          className={`mr-4 p-3 rounded-full bg-white/10 backdrop-blur-sm transition-colors ${
            currentIndex >= teamMembers.length - 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {Array.from({ length: Math.ceil(teamMembers.length / 3) }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentIndex(i * 3);
              containerRef.current?.scrollTo({ 
                left: i * 3 * 320,
                behavior: 'smooth'
              });
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              Math.floor(currentIndex / 3) === i
                ? 'bg-purple-500 w-8'
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};