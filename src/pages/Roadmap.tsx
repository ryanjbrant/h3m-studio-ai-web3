import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { RoadmapPhase } from '../components/roadmap/RoadmapPhase';
import { RoadmapTimeline } from '../components/roadmap/RoadmapTimeline';
import { roadmapData } from '../data/roadmapData';

const Roadmap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      const timeline = timelineRef.current;
      const scrollPosition = window.scrollY;
      const timelineTop = timeline.offsetTop;
      const timelineHeight = timeline.offsetHeight;
      const windowHeight = window.innerHeight;
      
      const progress = (scrollPosition - timelineTop + windowHeight) / timelineHeight;
      timeline.style.setProperty('--scroll-progress', Math.min(Math.max(progress, 0), 1).toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="bg-[#0a0a0b] text-white min-h-screen">
      {/* Hero Section */}
      <motion.section 
        style={{ opacity, scale }}
        className="min-h-[50vh] flex items-center justify-center relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-6"
          >
            HMMM Token Roadmap
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            Our vision for HMMM aligns seamlessly with the growth and development of Portals
          </motion.p>
        </div>
      </motion.section>

      {/* Timeline Section */}
      <section ref={timelineRef} className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <RoadmapTimeline>
            {roadmapData.map((phase, index) => (
              <RoadmapPhase
                key={phase.title}
                phase={phase}
                index={index}
                total={roadmapData.length}
              />
            ))}
          </RoadmapTimeline>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-[#0a0a0b]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-8">The Path Forward</h2>
            <p className="text-xl text-gray-300 mb-12">
              Together, we're unlocking the next era of human experience. Join us in shaping
              the future of immersive technology.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="group px-8 py-4 bg-blue-500 rounded-lg text-white font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
                Join the Journey
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Roadmap;