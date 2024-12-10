import React from 'react';
import { motion } from 'framer-motion';

interface CarouselSlideProps {
  children: React.ReactNode;
  index: number;
  currentIndex: number;
  direction: number;
}

export const CarouselSlide: React.FC<CarouselSlideProps> = ({
  children,
  index,
  currentIndex,
  direction
}) => {
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      className="absolute inset-0"
    >
      {children}
    </motion.div>
  );
};