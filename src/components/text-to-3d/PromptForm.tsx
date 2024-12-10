import React, { useState } from 'react';
import { ArtStyle } from '../../types/meshy';

interface PromptFormProps {
  onSubmit: (prompt: string, artStyle: ArtStyle, negativePrompt?: string) => void;
  disabled?: boolean;
}

export const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, disabled }) => {
  const [prompt, setPrompt] = useState('');
  const [artStyle, setArtStyle] = useState<ArtStyle>('realistic');
  const [negativePrompt, setNegativePrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt, artStyle, negativePrompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full px-3 py-2 bg-[#0a0a0b] border border-[#242429] rounded-md text-white"
          rows={3}
          placeholder="Describe what you want to create..."
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Art Style</label>
        <select
          value={artStyle}
          onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
          className="w-full px-3 py-2 bg-[#0a0a0b] border border-[#242429] rounded-md text-white"
          disabled={disabled}
        >
          <option value="realistic">Realistic</option>
          <option value="cartoon">Cartoon</option>
          <option value="low-poly">Low Poly</option>
          <option value="sculpture">Sculpture</option>
          <option value="pbr">PBR</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Negative Prompt (Optional)</label>
        <textarea
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          className="w-full px-3 py-2 bg-[#0a0a0b] border border-[#242429] rounded-md text-white"
          rows={2}
          placeholder="Describe what you don't want..."
          disabled={disabled}
        />
      </div>

      <button
        type="submit"
        disabled={disabled || !prompt.trim()}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
      >
        Generate
      </button>
    </form>
  );
};