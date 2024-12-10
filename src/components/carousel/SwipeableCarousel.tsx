import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CarouselProvider } from './CarouselContext';
import { CarouselSlide } from './CarouselSlide';
import { CarouselControls } from './CarouselControls';

interface SwipeableCarouselProps {
  slides: React.ReactNode[];
  autoPlayInterval?: number;
}

export const SwipeableCarousel: React.FC<SwipeableCarouselProps> = ({
  slides,
  autoPlayInterval = 5000
}) => {
  const [[currentIndex, direction], setPage] = useState([0, 0]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (!autoPlayInterval) return;

    const interval = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, autoPlayInterval]);

  const paginate = (newDirection: number) => {
    const newIndex = (currentIndex + newDirection + slides.length) % slides.length;
    setPage([newIndex, newDirection]);
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

    if (isLeftSwipe) {
      paginate(1);
    } else if (isRightSwipe) {
      paginate(-1);
    }
  };

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return (
    <CarouselProvider>
      <div 
        className="relative h-full w-full overflow-hidden"
        {...swipeHandlers}
      >
        <AnimatePresence initial={false} custom={direction}>
          <CarouselSlide
            key={currentIndex}
            index={currentIndex}
            currentIndex={currentIndex}
            direction={direction}
          >
            {slides[currentIndex]}
          </CarouselSlide>
        </AnimatePresence>

        <CarouselControls
          onNext={() => paginate(1)}
          onPrevious={() => paginate(-1)}
        />
      </div>
    </CarouselProvider>
  );
};