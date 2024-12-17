import { useState } from 'react';
import { Sun, Grid, Box, Palette } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ViewerHeaderProps {
  onViewChange: (view: 'model' | 'scene') => void;
  onDisplayModeChange: (mode: 'wireframe' | 'shaded' | 'albedo') => void;
  onLightIntensityChange: (intensity: number) => void;
  currentView: 'model' | 'scene';
}

export function ViewerHeader({
  onViewChange,
  onDisplayModeChange,
  onLightIntensityChange,
  currentView
}: ViewerHeaderProps) {
  const [showLightSlider, setShowLightSlider] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(1);

  const handleLightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLightIntensity(value);
    onLightIntensityChange(value);
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
      {/* View Toggle */}
      <div className="flex bg-[#0a0a0b] border border-[#242429] rounded-lg overflow-hidden">
        <button
          onClick={() => onViewChange('model')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            currentView === 'model'
              ? 'bg-[#242429] text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#1a1a1f]'
          )}
        >
          Model
        </button>
        <button
          onClick={() => onViewChange('scene')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-l border-[#242429]',
            currentView === 'scene'
              ? 'bg-[#242429] text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#1a1a1f]'
          )}
        >
          Scene
        </button>
      </div>

      {/* Display Mode Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => onDisplayModeChange('wireframe')}
          className="p-2 bg-[#0a0a0b] border border-[#242429] rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1f] transition-colors"
          title="Wireframe"
        >
          <Grid className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDisplayModeChange('shaded')}
          className="p-2 bg-[#0a0a0b] border border-[#242429] rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1f] transition-colors"
          title="Shaded"
        >
          <Box className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDisplayModeChange('albedo')}
          className="p-2 bg-[#0a0a0b] border border-[#242429] rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1f] transition-colors"
          title="Albedo"
        >
          <Palette className="w-5 h-5" />
        </button>
      </div>

      {/* Light Control */}
      <div className="relative">
        <button
          onClick={() => setShowLightSlider(!showLightSlider)}
          className="p-2 bg-[#0a0a0b] border border-[#242429] rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1f] transition-colors"
          title="Light Intensity"
        >
          <Sun className="w-5 h-5" />
        </button>
        
        {showLightSlider && (
          <div className="absolute top-full right-0 mt-2 p-4 bg-[#0a0a0b] border border-[#242429] rounded-lg shadow-lg">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lightIntensity}
                onChange={handleLightChange}
                className="w-32 accent-blue-500"
              />
              <span className="text-sm text-gray-400 min-w-[3ch]">
                {lightIntensity.toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 