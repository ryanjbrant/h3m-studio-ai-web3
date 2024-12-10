import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Heart, Lightbulb, Target } from 'lucide-react';

const cards = [
  {
    icon: Rocket,
    title: "Innovation Without Limits",
    description: "Pushing the boundaries of what's possible in AR, AI, and immersive experiences."
  },
  {
    icon: Heart,
    title: "Human-Centered Design",
    description: "Creating technology that enhances human connection and creativity."
  },
  {
    icon: Lightbulb,
    title: "Creative Empowerment",
    description: "Providing tools that unlock boundless creative potential for everyone."
  },
  {
    icon: Target,
    title: "Sustainable Growth",
    description: "Building a future where technology and humanity evolve together harmoniously."
  }
];

export const MissionCards: React.FC = () => {
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
          <card.icon className="w-12 h-12 text-blue-500 mb-6" />
          <h3 className="text-xl font-bold mb-4">{card.title}</h3>
          <p className="text-gray-400">{card.description}</p>
        </motion.div>
      ))}
    </div>
  );
};