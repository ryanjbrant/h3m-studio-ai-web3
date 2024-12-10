import React, { useState } from 'react';
import { TextureRichness } from '../../types/meshy';

interface RefineControlsProps {
  onRefine: (textureRichness: TextureRichness) => void;
  disabled?: boolean;
}

export const RefineControls: React.FC<RefineControlsProps> = ({ onRefine, disabled }) => {
  const [textureRichness, setTextureRichness] = useState<TextureRichness>('high');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRefine(textureRichness);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Texture Richness</label>
        <select
          value={textureRichness}
          onChange={(e) => setTextureRichness(e.target.value as TextureRichness)}
          className="w-full px-3 py-2 bg-[#0a0a0b] border border-[#242429] rounded-md text-white"
          disabled={disabled}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="none">None</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
      >
        Refine Model
      </button>
    </form>
  );
};