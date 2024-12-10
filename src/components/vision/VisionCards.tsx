import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Cpu, Users, Lock } from 'lucide-react';

const cards = [
  {
    icon: Globe,
    title: "Seamless Integration",
    description: "Bridging physical and digital worlds through advanced AR technology."
  },
  {
    icon: Cpu,
    title: "AI-Powered Future",
    description: "Leveraging artificial intelligence to create adaptive, intelligent experiences."
  },
  {
    icon: Users,
    title: "Community-Driven",
    description: "Building a thriving ecosystem of creators, developers, and innovators."
  },
  {
    icon: Lock,
    title: "Secure Foundation",
    description: "Ensuring privacy and security in every immersive interaction."
  }
];

export const VisionCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto px-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="bg-[#121214] p-8 rounded-2xl border border-[#242429]"
        >
          <card.icon className="w-12 h-12 text-purple-500 mb-6" />
          <h3 className="text-xl font-bold mb-4">{card.title}</h3>
          <p className="text-gray-400">{card.description}</p>
        </motion.div>
      ))}
    </div>
  );
};