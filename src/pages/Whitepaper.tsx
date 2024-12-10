import React, { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Cpu, Layers, Box, Palette, Users, Puzzle, Lock, Gamepad, Network } from 'lucide-react';

const Whitepaper: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <div ref={containerRef} className="bg-[#0a0a0b] text-white">
      {/* Hero Section */}
      <motion.section 
        style={{ opacity, scale }}
        className="min-h-screen flex items-center justify-center relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-6"
          >
            The Next Evolution of Reality
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 mb-8"
          >
            H3M and Portals: Bridging the Future of AI, DeFi, and Immersive Reality
          </motion.p>
        </div>
      </motion.section>

      {/* Introduction */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="prose prose-invert max-w-none"
          >
            <p className="text-xl leading-relaxed">
              Portals by H3M is not just an app—it's a revolution. At the intersection of augmented reality (AR), 
              artificial intelligence (AI), and decentralized finance (DeFi), we are pioneering a new layer of human 
              experience that redefines how we interact with digital and physical worlds. This is the future of 
              utility in AR. This is the new standard for value in Web3.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-32 bg-[#0a0a0b]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center">Why Portals Is the Future</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#121214] p-8 rounded-2xl border border-[#242429]"
            >
              <Box className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">AR That Transcends Entertainment</h3>
              <p className="text-gray-400">
                Transform physical spaces into dynamic playgrounds for commerce, storytelling, and interaction.
                Imagine walking into a boutique where the entire layout adjusts to your preferences.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#121214] p-8 rounded-2xl border border-[#242429]"
            >
              <Cpu className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">AI as the Architect of Reality</h3>
              <p className="text-gray-400">
                Our AI doesn't just power the platform—it powers the possibilities. From spatial computing 
                to generative design tools that empower artists to create assets instantly.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#121214] p-8 rounded-2xl border border-[#242429]"
            >
              <Layers className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">DeFi Meets Immersive Commerce</h3>
              <p className="text-gray-400">
                Enable seamless monetization of AR content with smart contracts for instant royalties,
                tokenized assets for true ownership, and revenue splits for collaborations.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="py-32 bg-[#0a0a0b] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold mb-16 text-center">Our Core Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#121214]/80 backdrop-blur p-8 rounded-2xl border border-[#242429]"
            >
              <Palette className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Creative Empowerment</h3>
              <p className="text-gray-400">
                Artists and brands get access to unprecedented tools: real-time world-building,
                AR-ready asset libraries, and customizable shaders.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#121214]/80 backdrop-blur p-8 rounded-2xl border border-[#242429]"
            >
              <Users className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Decentralized Collaboration</h3>
              <p className="text-gray-400">
                Brands and users are co-creators, defining immersive categories and sharing
                profits across their ecosystems.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#121214]/80 backdrop-blur p-8 rounded-2xl border border-[#242429]"
            >
              <Puzzle className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Seamless Accessibility</h3>
              <p className="text-gray-400">
                Bridge the technical gap with plugins for professional tools and no-code
                scene builders for immediate creation.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Adoption & Security */}
      <section className="py-32 bg-[#0a0a0b]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center">Breaking the Barriers of Adoption</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#121214] p-8 rounded-2xl border border-[#242429]"
            >
              <Lock className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Built on Trust and Transparency</h3>
              <p className="text-gray-400">
                Crafted with blockchain at its core: decentralized, transparent, and secure.
                Our tokenomics ensure equal benefit distribution.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#121214] p-8 rounded-2xl border border-[#242429]"
            >
              <Gamepad className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Gamified Onboarding</h3>
              <p className="text-gray-400">
                Learn by doing, earn rewards as you explore. This isn't a tutorial—it's
                a journey of discovery and value creation.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#121214] p-8 rounded-2xl border border-[#242429]"
            >
              <Network className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Interoperability at Scale</h3>
              <p className="text-gray-400">
                Enable cross-platform compatibility, integrating seamlessly with leading
                VR/AR tools and AI engines.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-32 bg-[#0a0a0b] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-8">Ambitious But Achievable</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-xl text-gray-300 mb-8">
                Our roadmap includes revolutionary features like Live Concert Immersions,
                Layer-2 Protocol Expansion, AI-Generated Virtual Economies, and Social
                Gamification that transforms AR into multiplayer experiences.
              </p>
              <p className="text-xl text-gray-300 mb-8">
                Supported by $450k in presales and partnerships with global brands,
                we're building an ecosystem designed to scale with the most dynamic
                industries on the planet.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 bg-[#0a0a0b]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-8">Join the Revolution</h2>
            <p className="text-xl text-gray-300 mb-12">
              The future isn't something you wait for; it's something you create.
              Whether you're an artist, a brand, a developer, or a dreamer, Portals
              invites you to join us in shaping the next chapter of human connection.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-8 py-4 bg-blue-500 rounded-lg text-white font-medium hover:bg-blue-600 transition-colors">
                Learn More
              </button>
              <button className="px-8 py-4 bg-[#242429] rounded-lg text-white font-medium hover:bg-[#2a2a2f] transition-colors">
                Join Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Whitepaper;