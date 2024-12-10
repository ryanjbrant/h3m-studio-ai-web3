import React from 'react';
import { Sun, Lightbulb, Target, Disc } from 'lucide-react';
import { useLightingStore } from '../../store/lightingStore';

export const LightingControls: React.FC = () => {
  const { lights, addLight, removeLight, updateLight } = useLightingStore();

  const lightTypes = [
    { type: 'ambient', icon: Disc, label: 'Ambient' },
    { type: 'directional', icon: Sun, label: 'Directional' },
    { type: 'point', icon: Lightbulb, label: 'Point' },
    { type: 'spot', icon: Target, label: 'Spot' }
  ] as const;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#121214] border border-[#242429] rounded-lg p-2">
      <div className="flex gap-2">
        {lightTypes.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => addLight(type)}
            className="p-2 hover:bg-[#242429] rounded-lg group flex flex-col items-center gap-1"
            title={`Add ${label} Light`}
          >
            <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
            <span className="text-xs text-gray-400 group-hover:text-white">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};