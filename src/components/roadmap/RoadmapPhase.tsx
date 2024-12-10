import React from 'react';
import { motion } from 'framer-motion';
import { Phase } from '../../types/roadmap';

interface RoadmapPhaseProps {
  phase: Phase;
  index: number;
  total: number;
}

export const RoadmapPhase: React.FC<RoadmapPhaseProps> = ({ phase, index, total }) => {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative flex items-center gap-8 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Timeline Node */}
      <div className="w-4 h-4 bg-blue-500 rounded-full relative z-10">
        <div className="absolute inset-0 bg-blue-500/50 rounded-full animate-ping" />
      </div>

      {/* Content */}
      <div className={`flex-1 bg-[#121214] border border-[#242429] rounded-xl p-6 ${
        isEven ? 'mr-[50%]' : 'ml-[50%]'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{phase.title}</h3>
          <span className="text-sm text-gray-400">{phase.timeline}</span>
        </div>
        <p className="text-gray-400 mb-4">{phase.description}</p>
        <ul className="space-y-2">
          {phase.goals.map((goal, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
              <span className="text-sm text-gray-300">{goal}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};