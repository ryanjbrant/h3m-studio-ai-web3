import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipe } from '../../hooks/useSwipe';

interface UseCase {
  title: string;
  description: string;
  features: string[];
  image: string;
}

const useCases: UseCase[] = [
  {
    title: "Gaming Revolution",
    description: "Turn players into publishers with IP they can extend, share, and monetize.",
    features: [
      "Players gain access to IP and extend game experiences",
      "Platform agnostic publishing tools",
      "Pay-to-play incentives for sustainable growth"
    ],
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80"
  },
  {
    title: "Entertainment Evolution",
    description: "Transform passive viewing into interactive experiences.",
    features: [
      "Immersive storytelling environments",
      "Interactive character engagement",
      "Real-time content adaptation"
    ],
    image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&q=80"
  },
  {
    title: "Music & Live Events",
    description: "Redefine live performances with immersive technology.",
    features: [
      "Virtual concert experiences",
      "Interactive music visualization",
      "Artist-fan direct engagement"
    ],
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80"
  },
  {
    title: "Creator Economy",
    description: "Empower creators with next-generation tools and monetization.",
    features: [
      "AI-powered content creation",
      "Blockchain-based ownership",
      "Cross-platform distribution"
    ],
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80"
  },
  {
    title: "Education Reimagined",
    description: "Transform learning through immersive experiences.",
    features: [
      "Interactive 3D learning environments",
      "Real-time collaboration tools",
      "Adaptive learning paths"
    ],
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80"
  },
  {
    title: "Travel & Exploration",
    description: "Experience destinations in unprecedented ways.",
    features: [
      "Virtual location previews",
      "Interactive travel guides",
      "Cultural immersion experiences"
    ],
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80"
  }
];

export const UseCaseCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + useCases.length) % useCases.length);
  };

  const swipeHandlers = useSwipe(
    () => paginate(1),
    () => paginate(-1)
  );

  return (
    <div className="relative h-[600px] w-full overflow-hidden bg-gradient-to-b from-purple-500/5 to-transparent">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 1000 : -1000 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction < 0 ? 1000 : -1000 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0"
          {...swipeHandlers}
        >
          <div className="w-full max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
            <div className="space-y-6">
              <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                {useCases[currentIndex].title}
              </h3>
              <p className="text-xl text-gray-300">
                {useCases[currentIndex].description}
              </p>
              <ul className="space-y-4">
                {useCases[currentIndex].features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[400px] rounded-xl overflow-hidden">
              <img
                src={useCases[currentIndex].image}
                alt={useCases[currentIndex].title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-y-0 left-0 w-32 flex items-center justify-start pointer-events-auto">
          <button
            className="ml-4 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors z-10"
            onClick={() => paginate(-1)}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 w-32 flex items-center justify-end pointer-events-auto">
          <button
            className="mr-4 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors z-10"
            onClick={() => paginate(1)}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {useCases.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const newDirection = index > currentIndex ? 1 : -1;
              setDirection(newDirection);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-purple-500 w-8' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};