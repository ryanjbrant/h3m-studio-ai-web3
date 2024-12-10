import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCarousel } from './CarouselContext';

interface CarouselControlsProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const CarouselControls: React.FC<CarouselControlsProps> = ({
  onNext,
  onPrevious
}) => {
  const { currentIndex, slideCount } = useCarousel();

  return (
    <>
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          onClick={onPrevious}
          className="p-2 m-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={onNext}
          className="p-2 m-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {Array.from({ length: slideCount }).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-6' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => {
              const direction = index > currentIndex ? 1 : -1;
              if (index !== currentIndex) {
                if (direction === 1) {
                  onNext();
                } else {
                  onPrevious();
                }
              }
            }}
          />
        ))}
      </div>
    </>
  );
};