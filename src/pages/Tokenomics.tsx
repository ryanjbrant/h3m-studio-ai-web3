import React, { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Coins, 
  BarChart3, 
  ShoppingBag, 
  Trophy,
  Lock,
  Users,
  Globe,
  Wallet,
  PieChart,
  ArrowRight
} from 'lucide-react';

const Tokenomics: React.FC = () => {
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
            Tokenomics
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            The Utility of the HMMM Token
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
              The HMMM token is the fuel powering the Portals ecosystem, creating a seamless connection 
              between creators, brands, and users while redefining engagement and ownership in the 
              immersive reality space. Designed with purpose and scalability, HMMM is more than a 
              currency—it's a bridge to limitless possibilities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Functions Grid */}
      <section className="py-32 bg-[#0a0a0b]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center">Core Functions of the HMMM Token</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Coins,
                title: "Asset Ownership and Monetization",
                description: "Facilitate true ownership of digital assets, empowering users to create, buy, and sell AR content with full transparency."
              },
              {
                icon: ShoppingBag,
                title: "Marketplace Transactions",
                description: "Power the marketplace with seamless transactions for purchasing immersive experiences and trading digital assets."
              },
              {
                icon: Trophy,
                title: "Creator Incentives",
                description: "Reward creators through automated smart contracts for every interaction with their content."
              },
              {
                icon: Users,
                title: "Community Governance",
                description: "Enable token holders to shape the future of Portals through decentralized governance."
              },
              {
                icon: Lock,
                title: "Premium Features",
                description: "Unlock advanced functionality including pro-level AR editors and AI-powered tools."
              },
              {
                icon: Globe,
                title: "Interoperability",
                description: "Seamlessly transfer value between Portals and other blockchain ecosystems."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-[#121214] p-8 rounded-2xl border border-[#242429]"
              >
                <item.icon className="w-12 h-12 text-blue-500 mb-6" />
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="py-32 bg-[#0a0a0b] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold mb-16 text-center">Token Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-[#121214]/80 backdrop-blur p-8 rounded-2xl border border-[#242429]"
            >
              <PieChart className="w-full h-64 text-blue-500 mb-8" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Ecosystem Growth</span>
                  <span className="font-bold">40%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Team & Development</span>
                  <span className="font-bold">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Community Initiatives</span>
                  <span className="font-bold">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Marketing & Partnerships</span>
                  <span className="font-bold">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Liquidity Pool</span>
                  <span className="font-bold">10%</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-[#121214]/80 backdrop-blur p-8 rounded-2xl border border-[#242429] flex flex-col justify-center"
            >
              <h3 className="text-2xl font-bold mb-6">Sustainability & Growth</h3>
              <p className="text-gray-400 mb-8">
                HMMM tokens are carefully allocated to ensure the long-term sustainability 
                and growth of the ecosystem. Our distribution model focuses on community 
                engagement, development resources, and maintaining a healthy market dynamic.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-400">
                  <Wallet className="w-5 h-5 text-blue-500" />
                  <span>Strategic token release schedule</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <Lock className="w-5 h-5 text-blue-500" />
                  <span>Vesting periods for team allocation</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <span>Dynamic liquidity management</span>
                </div>
              </div>
            </motion.div>
          </div>
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
            <h2 className="text-4xl font-bold mb-8">A Future of Infinite Possibilities</h2>
            <p className="text-xl text-gray-300 mb-12">
              The HMMM token isn't just a currency—it's a utility designed to empower creators, 
              reward participants, and drive innovation. As Portals expands, HMMM will continue 
              to evolve, creating unparalleled opportunities in AR, AI, and DeFi.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="group px-8 py-4 bg-blue-500 rounded-lg text-white font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Tokenomics;