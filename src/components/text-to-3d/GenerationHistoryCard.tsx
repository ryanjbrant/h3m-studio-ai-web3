import React from 'react';
import { Loader2 } from 'lucide-react';
import { MeshyPreviewTask } from '../../types/meshy';

interface GenerationHistoryCardProps {
  task: MeshyPreviewTask;
  isSelected: boolean;
  onClick: () => void;
}

export const GenerationHistoryCard: React.FC<GenerationHistoryCardProps> = ({
  task,
  isSelected,
  onClick,
}) => {
  const isGenerating = task.status === 'PENDING' || task.status === 'IN_PROGRESS';
  const hasFailed = task.status === 'FAILED';
  const isClickable = task.status === 'SUCCEEDED';

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`
        w-full aspect-square rounded-lg overflow-hidden relative transition-all
        ${isSelected ? 'ring-2 ring-blue-500' : isClickable ? 'hover:ring-2 hover:ring-[#242429]' : ''}
        ${isGenerating ? 'bg-[#121214]' : 'bg-[#0a0a0b]'}
        ${hasFailed ? 'bg-red-900/20' : ''}
        ${!isClickable && !isGenerating ? 'cursor-not-allowed opacity-50' : ''}
      `}
    >
      {isGenerating ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" />
          <span className="text-sm text-gray-400">{task.progress}%</span>
        </div>
      ) : task.thumbnail_url && task.status === 'SUCCEEDED' ? (
        <img
          src={task.thumbnail_url}
          alt={task.prompt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-red-400">
          {hasFailed ? 'Failed' : 'Unavailable'}
        </div>
      )}
    </button>
  );
};