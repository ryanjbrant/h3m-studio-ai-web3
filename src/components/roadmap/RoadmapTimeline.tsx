import React from 'react';

interface RoadmapTimelineProps {
  children: React.ReactNode;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ children }) => {
  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#242429] transform -translate-x-1/2">
        <div 
          className="absolute top-0 bottom-0 w-full bg-blue-500 origin-top"
          style={{ 
            transform: 'scaleY(var(--scroll-progress, 0))',
            transition: 'transform 0.1s linear'
          }}
        />
      </div>

      {/* Timeline Content */}
      <div className="space-y-24 relative">
        {children}
      </div>
    </div>
  );
};