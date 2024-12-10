import React, { useEffect, useRef, useState } from 'react';
import { Box, Cpu, Layers } from 'lucide-react';
import { gsap } from 'gsap';

const cards = [
  {
    icon: Box,
    title: '3D Tools',
    description: 'Professional-grade tools for 3D content creation and texture generation',
  },
  {
    icon: Cpu,
    title: 'AI Integration',
    description: 'Advanced AI algorithms for automated content generation and optimization',
  },
  {
    icon: Layers,
    title: 'DeFi Features',
    description: 'Integrated DeFi capabilities for tokenization and staking',
  },
];

const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isScrollingRef = useRef(false);
  const lastScrollTime = useRef(Date.now());
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const scrollToCard = (index: number) => {
    if (isScrollingRef.current) return;
    
    const newIndex = Math.max(0, Math.min(cards.length - 1, index));
    if (newIndex === activeIndex) return;

    isScrollingRef.current = true;
    setActiveIndex(newIndex);

    gsap.to(cardsContainerRef.current, {
      x: `${-newIndex * 100}%`,
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        isScrollingRef.current = false;
      },
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let accumulatedDelta = 0;
    const threshold = 50;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const now = Date.now();
      const timeDiff = now - lastScrollTime.current;
      
      if (timeDiff < 50) return;
      lastScrollTime.current = now;

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      accumulatedDelta += Math.abs(e.deltaY) > 1 ? Math.sign(e.deltaY) * threshold : e.deltaY;

      scrollTimeout.current = setTimeout(() => {
        if (Math.abs(accumulatedDelta) >= threshold) {
          const direction = accumulatedDelta > 0 ? 1 : -1;
          scrollToCard(activeIndex + direction);
        }
        accumulatedDelta = 0;
      }, 50);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [activeIndex]);

  return (
    <div 
      ref={containerRef}
      className="h-[calc(100vh-44px)] w-full overflow-hidden bg-[#0a0a0b]"
    >
      <div 
        ref={cardsContainerRef}
        className="relative h-full flex pt-4 transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${-activeIndex * 100}%)` }}
      >
        {cards.map((card, index) => {
          const Icon = card.icon;
          const isActive = index === activeIndex;
          
          return (
            <div
              key={card.title}
              className={`flex-shrink-0 w-full px-4 transition-all duration-500 ${
                isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
              }`}
            >
              <div className="w-full h-[400px] p-8 bg-[#121214] rounded-lg border border-[#242429] transform-gpu max-w-7xl mx-auto">
                <Icon className={`w-16 h-16 mb-6 transition-colors duration-500 ${
                  isActive ? 'text-blue-500' : 'text-gray-600'
                }`} />
                <h2 className="text-3xl font-bold mb-4">{card.title}</h2>
                <p className="text-xl text-gray-400">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {cards.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'bg-blue-500 w-6' : 'bg-gray-600'
            }`}
            onClick={() => scrollToCard(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default LandingPage;