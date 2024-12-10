import React, { createContext, useContext, useState } from 'react';

interface CarouselContextType {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  slideCount: number;
  setSlideCount: (count: number) => void;
}

const CarouselContext = createContext<CarouselContextType | undefined>(undefined);

export const CarouselProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  return (
    <CarouselContext.Provider value={{
      currentIndex,
      setCurrentIndex,
      slideCount,
      setSlideCount
    }}>
      {children}
    </CarouselContext.Provider>
  );
};

export const useCarousel = () => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a CarouselProvider');
  }
  return context;
};