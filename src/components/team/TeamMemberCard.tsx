import React from 'react';
import { motion } from 'framer-motion';

interface TeamMember {
  name: string;
  title: string;
  experience: string;
  background: string;
  image: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="relative overflow-hidden rounded-xl aspect-[3/4]">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
              {member.title}
            </div>
            <p className="text-gray-300 text-sm">{member.experience}</p>
            <p className="text-gray-400 text-sm">{member.background}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};