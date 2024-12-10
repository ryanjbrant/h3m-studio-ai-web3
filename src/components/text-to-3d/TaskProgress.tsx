import React from 'react';

interface TaskProgressProps {
  progress: number;
}

export const TaskProgress: React.FC<TaskProgressProps> = ({ progress }) => {
  return (
    <div className="bg-[#121214] rounded-lg border border-[#242429] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Generating...</span>
        <span className="text-sm text-gray-400">{progress}%</span>
      </div>
      <div className="w-full bg-[#0a0a0b] rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};