import React, { useState } from 'react';
import { useTextureStore } from '../store/textureStore';
import { MapPreview } from './MapPreview';
import { MapControls } from './MapControls';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface ControlsProps {
  maps: {
    normal: ImageData | null;
    displacement: ImageData | null;
    specular: ImageData | null;
    ao: ImageData | null;
  } | null;
  onGenerate?: (settings: any) => Promise<string>;
  isGenerating?: boolean;
  createContent?: React.ReactNode;
}

export const Controls: React.FC<ControlsProps> = ({ 
  maps, 
  onGenerate, 
  isGenerating,
  createContent 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<'create' | 'texture'>>(new Set(['create']));
  const [activeTextureTab, setActiveTextureTab] = useState<'normal' | 'displacement' | 'ao' | 'specular'>('normal');

  const textureTabs = [
    { id: 'normal', label: 'Normals' },
    { id: 'displacement', label: 'Displacement' },
    { id: 'ao', label: 'AO' },
    { id: 'specular', label: 'Specular' },
  ] as const;

  const toggleSection = (section: 'create' | 'texture') => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full h-full bg-[#1a1a1d] overflow-hidden flex flex-col">
      {/* Create Section */}
      <div>
        <button
          onClick={() => toggleSection('create')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#242429] transition-colors border-b border-[#242429]"
        >
          <span className="text-sm font-medium text-white">Create</span>
          {expandedSections.has('create') ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {expandedSections.has('create') && (
          <div className="overflow-y-auto">
            {createContent}
          </div>
        )}
      </div>

      {/* Texture Section */}
      <div>
        <button
          onClick={() => toggleSection('texture')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#242429] transition-colors border-b border-[#242429]"
        >
          <span className="text-sm font-medium text-white">Texture</span>
          {expandedSections.has('texture') ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {expandedSections.has('texture') && (
          <div className="overflow-y-auto">
            <div className="flex border-b border-[#242429]">
              {textureTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTextureTab(tab.id)}
                  className={cn(
                    'flex-1 px-4 py-2 text-sm font-medium transition-colors',
                    activeTextureTab === tab.id
                      ? 'text-white border-b-2 border-blue-500 bg-[#242429]'
                      : 'text-gray-400 hover:text-white hover:bg-[#242429]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto">
              {maps && maps[activeTextureTab] && (
                <div className="flex flex-col">
                  <div className="w-full">
                    <MapPreview imageData={maps[activeTextureTab]} />
                  </div>
                  <MapControls mapType={activeTextureTab} imageData={maps[activeTextureTab]} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}