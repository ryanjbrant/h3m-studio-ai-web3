import React, { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { motion, useScroll, useTransform } from 'framer-motion';
import { VideoBackground } from '../components/VideoBackground';
import { TeamCarousel } from '../components/team/TeamCarousel';

const Team: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className="bg-[#0a0a0b] text-white">
      {/* Hero Section */}
      <motion.section 
        style={{ opacity, scale }}
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
      >
        <VideoBackground />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-6"
          >
            Meet the H3M Team
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            Visionaries Behind the Future of AR
          </motion.p>
        </div>
      </motion.section>

      {/* Team Description */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.p
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-300 mb-16"
          >
            At H3M, we are more than a team—we're a collective of dreamers, builders, and creators driven by a shared mission to redefine what's possible. With decades of combined experience across augmented reality, design, technology, and storytelling, we're crafting tools that unlock the full potential of human imagination.
          </motion.p>
        </div>
      </section>

      {/* Team Carousel */}
      <section className="py-24">
        <TeamCarousel />
      </section>
    </div>
  );
};

export default Team;