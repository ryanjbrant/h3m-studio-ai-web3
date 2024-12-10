import React, { useState } from 'react';
import { useTextureStore } from '../store/textureStore';
import { FilterType } from '../types';
import { MapPreview } from './MapPreview';
import { MapControls } from './MapControls';

interface ControlsProps {
  maps: {
    normal: ImageData;
    displacement: ImageData;
    specular: ImageData;
    ao: ImageData;
  } | null;
}

export const Controls: React.FC<ControlsProps> = ({ maps }) => {
  const { settings, updateSettings } = useTextureStore();
  const [activeTab, setActiveTab] = useState<'normal' | 'displacement' | 'ao' | 'specular'>('normal');

  const tabs = [
    { id: 'normal', label: 'Normals' },
    { id: 'displacement', label: 'Displacement' },
    { id: 'ao', label: 'AO' },
    { id: 'specular', label: 'Specular' },
  ] as const;

  return (
    <div className="w-full h-full bg-[rgb(var(--muted))] rounded-lg overflow-hidden flex flex-col">
      <div className="flex border-b border-[rgba(var(--foreground),0.1)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-[rgb(var(--accent))] border-b-2 border-[rgb(var(--accent))] bg-[rgba(var(--foreground),0.05)]'
                : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--foreground),0.05)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {maps && maps[activeTab] && (
          <div className="flex flex-col h-full">
            <div className="w-full">
              <MapPreview imageData={maps[activeTab]} />
            </div>
            <MapControls mapType={activeTab} imageData={maps[activeTab]} />
          </div>
        )}
      </div>
    </div>
  );
}