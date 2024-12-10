import React, { useState } from 'react';
import { ChevronDown, Download, ChevronRight } from 'lucide-react';
import { DownloadDropdown } from './DownloadDropdown';
import { useTextureStore } from '../store/textureStore';
import { Slider } from './Slider';

interface MapControlsProps {
  mapType: 'normal' | 'displacement' | 'ao' | 'specular';
  imageData: ImageData;
}

export const MapControls: React.FC<MapControlsProps> = ({ mapType, imageData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { settings, updateSettings } = useTextureStore();

  const renderNormalControls = () => (
    <div className="space-y-4">
      <Slider
        label="Strength"
        value={settings.normal.strength}
        onChange={(value) => updateSettings('normal', { strength: value })}
        min={0}
        max={200}
        step={1}
      />
      <Slider
        label="Blur"
        value={settings.normal.blur}
        onChange={(value) => updateSettings('normal', { blur: value })}
        min={0}
        max={50}
        step={0.1}
      />
      <Slider
        label="Detail Level"
        value={settings.normal.detailLevel}
        onChange={(value) => updateSettings('normal', { detailLevel: value })}
        min={1}
        max={10}
        step={1}
      />
      <Slider
        label="Height"
        value={settings.normal.height}
        onChange={(value) => updateSettings('normal', { height: value })}
        min={0}
        max={100}
        step={1}
      />
    </div>
  );

  const renderDisplacementControls = () => (
    <div className="space-y-4">
      <Slider
        label="Contrast"
        value={settings.displacement.contrast}
        onChange={(value) => updateSettings('displacement', { contrast: value })}
        min={-100}
        max={100}
        step={1}
      />
      <Slider
        label="Blur"
        value={settings.displacement.blur}
        onChange={(value) => updateSettings('displacement', { blur: value })}
        min={0}
        max={50}
        step={0.1}
      />
    </div>
  );

  const renderAOControls = () => (
    <div className="space-y-4">
      <Slider
        label="Strength"
        value={settings.ao.strength}
        onChange={(value) => updateSettings('ao', { strength: value })}
        min={0}
        max={200}
        step={1}
      />
      <Slider
        label="Mean"
        value={settings.ao.mean}
        onChange={(value) => updateSettings('ao', { mean: value })}
        min={0}
        max={100}
        step={1}
      />
      <Slider
        label="Range"
        value={settings.ao.range}
        onChange={(value) => updateSettings('ao', { range: value })}
        min={0}
        max={100}
        step={1}
      />
      <Slider
        label="Blur"
        value={settings.ao.blur}
        onChange={(value) => updateSettings('ao', { blur: value })}
        min={0}
        max={50}
        step={0.1}
      />
    </div>
  );

  const renderSpecularControls = () => (
    <div className="space-y-4">
      <Slider
        label="Strength"
        value={settings.specular.strength}
        onChange={(value) => updateSettings('specular', { strength: value })}
        min={0}
        max={200}
        step={1}
      />
      <Slider
        label="Mean"
        value={settings.specular.mean}
        onChange={(value) => updateSettings('specular', { mean: value })}
        min={0}
        max={100}
        step={1}
      />
      <Slider
        label="Range"
        value={settings.specular.range}
        onChange={(value) => updateSettings('specular', { range: value })}
        min={0}
        max={100}
        step={1}
      />
      <Slider
        label="Falloff"
        value={settings.specular.falloff}
        onChange={(value) => updateSettings('specular', { falloff: value })}
        min={0}
        max={100}
        step={1}
      />
    </div>
  );

  const renderControls = () => {
    switch (mapType) {
      case 'normal':
        return renderNormalControls();
      case 'displacement':
        return renderDisplacementControls();
      case 'ao':
        return renderAOControls();
      case 'specular':
        return renderSpecularControls();
      default:
        return null;
    }
  };

  return (
    <div className="border-t border-[#242429] flex-shrink-0">
      <div className="flex items-center justify-between p-4">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#242429] text-sm font-medium rounded-md text-white bg-[#0a0a0b] hover:bg-[#242429] transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
            <ChevronDown className="w-4 h-4" />
          </button>
          {showDropdown && (
            <DownloadDropdown
              imageData={imageData}
              mapType={mapType}
              onClose={() => setShowDropdown(false)}
            />
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
        >
          Refine
          <ChevronRight
            className={`w-4 h-4 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[500px]' : 'max-h-0'
        }`}
      >
        <div className="p-4 pt-0">
          {renderControls()}
        </div>
      </div>
    </div>
  );
};