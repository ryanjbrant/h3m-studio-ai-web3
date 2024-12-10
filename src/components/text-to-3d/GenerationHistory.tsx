import React from 'react';
import { MeshyPreviewTask } from '../../types/meshy';
import { GenerationHistoryCard } from './GenerationHistoryCard';

interface GenerationHistoryProps {
  tasks: MeshyPreviewTask[];
  selectedTaskId: string | null;
  onSelectTask: (task: MeshyPreviewTask) => void;
}

export const GenerationHistory: React.FC<GenerationHistoryProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
}) => {
  return (
    <div className="w-64 h-full bg-[#121214] border-r border-[#242429] p-4 overflow-y-auto">
      <h2 className="text-sm font-medium text-gray-400 mb-4">History</h2>
      <div className="grid grid-cols-2 gap-2">
        {tasks.map((task) => (
          <GenerationHistoryCard
            key={task.id}
            task={task}
            isSelected={task.id === selectedTaskId}
            onClick={() => {
              if (task.status === 'SUCCEEDED') {
                onSelectTask(task);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};