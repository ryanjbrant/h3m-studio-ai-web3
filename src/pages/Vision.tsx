import React, { useRef, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { motion, useScroll, useTransform } from 'framer-motion';
import { VideoBackground } from '../components/VideoBackground';
import { UseCaseCarousel } from '../components/vision/UseCaseCarousel';
import { VisionCards } from '../components/vision/VisionCards';

const Vision: React.FC = () => {
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
            The Future is Immersive
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl text-gray-300"
          >
            When AI/AR/XR merge, it will be the Big Bang of next-gen layer-2 experiences.
          </motion.p>
        </div>
      </motion.section>

      {/* Vision Cards */}
      <section className="py-24">
        <VisionCards />
      </section>

      {/* Use Cases Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto">
          <UseCaseCarousel />
        </div>
      </section>

      {/* Vision Content */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="prose prose-invert max-w-none"
          >
            <p className="text-xl leading-relaxed mb-8">
              Imagine a future where the barriers between the physical and digital worlds disappear. A world where experiences aren't constrained by screens or devices but blend effortlessly with the spaces we move through every day. This is the future we see—a tapestry woven from the threads of immersive technology and limitless creativity.
            </p>
            <p className="text-xl leading-relaxed mb-8">
              At the heart of this vision is augmented reality (AR), mixed reality (XR), and virtual reality (VR)—technologies that go beyond entertainment to redefine communication, education, healthcare, commerce, and beyond. They will power virtual marketplaces where transactions are instantaneous, transparent, and secure, thanks to the integration of blockchain technology.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Vision;