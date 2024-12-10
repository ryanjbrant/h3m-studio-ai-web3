import React, { useRef, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { motion, useScroll, useTransform } from 'framer-motion';
import { VideoBackground } from '../components/VideoBackground';
import { MissionCards } from '../components/mission/MissionCards';

const Mission: React.FC = () => {
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
            Our Mission
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            Redefining Creativity, Connection, and Innovation
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Cards */}
      <section className="py-24">
        <MissionCards />
      </section>

      {/* Content Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="prose prose-invert max-w-none"
          >
            <p className="text-xl leading-relaxed mb-8">
              At H3M, we are building a world where technology empowers boundless imagination. Our mission is simple but profound: to unlock the future of human connection and creativity through immersive, interactive, and innovative tools.
            </p>
            <p className="text-xl leading-relaxed mb-8">
              We believe in the power of what if. What if art wasn't just seen but felt? What if storytelling didn't end with the screen but extended into the spaces we inhabit? What if every creator, from individuals to brands, could reshape reality itself?
            </p>
            <p className="text-xl leading-relaxed mb-8">
              With Portals, our flagship product, we are transforming augmented reality into a seamless, accessible platform that allows anyone to create, share, and monetize their vision. Portals is more than an app—it's a movement, bringing together artists, brands, and audiences to explore the uncharted dimensions of experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why H3M Section */}
      <section className="py-24 bg-[#0a0a0b] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-8">Why H3M Stands Apart</h2>
            <p className="text-xl text-gray-300 mb-12">
              We bring the precision of cutting-edge engineering and the soul of artistry to every product we create. H3M stands at the intersection of trust, creativity, and technology. With transparency, simplicity, and elegance at our core, we aim to lead the new era of immersive innovation.
            </p>
            <p className="text-xl font-bold">
              Explore the extraordinary. Welcome to H3M.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Mission;