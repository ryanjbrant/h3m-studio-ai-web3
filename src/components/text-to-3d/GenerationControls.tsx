import React, { useState } from 'react';
import { Switch } from '../ui/Switch';

interface GenerationSettings {
  prompt: string;
  symmetry: 'off' | 'auto' | 'on';
  useFixedSeed: boolean;
  seed?: number;
  targetPolycount: 'adaptive' | 'low' | 'medium' | 'high' | 'ultra';
  topology: 'quad' | 'triangle';
}

interface GenerationControlsProps {
  onGenerate: (settings: GenerationSettings) => void;
  disabled?: boolean;
}

export const GenerationControls: React.FC<GenerationControlsProps> = ({ 
  onGenerate, 
  disabled 
}) => {
  const [settings, setSettings] = useState<GenerationSettings>({
    prompt: '',
    symmetry: 'auto',
    useFixedSeed: false,
    targetPolycount: 'adaptive',
    topology: 'quad'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(settings);
  };

  const characterCount = settings.prompt.length;
  const maxCharacters = 500;

  return (
    <form onSubmit={handleSubmit} className="border border-[#242429] rounded-lg p-4 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Prompt</label>
        <textarea
          value={settings.prompt}
          onChange={(e) => setSettings({ ...settings, prompt: e.target.value })}
          className="w-full px-3 py-2 bg-[#0a0a0b] border border-[#242429] rounded-md text-white resize-none"
          rows={4}
          maxLength={maxCharacters}
          placeholder="Describe the object you want to generate. You can use your native language."
          disabled={disabled}
        />
        <div className="mt-1 text-xs text-gray-400 text-right">
          {characterCount}/{maxCharacters}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Symmetry</label>
        <select
          value={settings.symmetry}
          onChange={(e) => setSettings({ ...settings, symmetry: e.target.value as any })}
          className="w-full px-3 py-2 bg-[#0a0a0b] border border-[#242429] rounded-md text-white"
          disabled={disabled}
        >
          <option value="off">Off</option>
          <option value="auto">Auto</option>
          <option value="on">On</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Use Fixed Seed</label>
        <Switch
          checked={settings.useFixedSeed}
          onCheckedChange={(checked) => setSettings({ ...settings, useFixedSeed: checked })}
          disabled={disabled}
        />
      </div>

      {settings.useFixedSeed && (
        <div>
          <label className="block text-sm font-medium mb-2">Seed</label>
          <input
            type="number"
            value={settings.seed || ''}
            onChange={(e) => setSettings({ ...settings, seed: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-[#0a0a0b] border border-[#242429] rounded-md text-white"
            disabled={disabled}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Target Polycount</label>
        <select
          value={settings.targetPolycount}
          onChange={(e) => setSettings({ ...settings, targetPolycount: e.target.value as any })}
          className="w-full px-3 py-2 bg-[#0a0a0b] border border-[#242429] rounded-md text-white"
          disabled={disabled}
        >
          <option value="adaptive">Adaptive</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="ultra">Ultra</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Topology</label>
        <select
          value={settings.topology}
          onChange={(e) => setSettings({ ...settings, topology: e.target.value as any })}
          className="w-full px-3 py-2 bg-[#0a0a0b] border border-[#242429] rounded-md text-white"
          disabled={disabled}
        >
          <option value="quad">Quad</option>
          <option value="triangle">Triangle</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={disabled || !settings.prompt.trim()}
        className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-pink-500 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-pink-600 transition-colors"
      >
        Generate
      </button>
    </form>
  );
};