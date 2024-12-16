import { useState } from 'react';
import { generateMaps } from '../../../utils/textureGenerator';
import { useTextureStore } from '../../../store/textureStore';
import { TextureDropzone } from './TextureDropzone';
import { GeneratedMaps } from '../../../types/texture';
import { TextureMapUrls } from '../../../types/model';

interface TextureHandlerProps {
  onTextureGenerated?: (maps: GeneratedMaps) => void;
  onTextureApplied?: (textureUrls: TextureMapUrls) => void;
  onTextureDropped?: (file: File) => void;
}

export function TextureHandler({ onTextureGenerated, onTextureApplied, onTextureDropped }: TextureHandlerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useTextureStore();

  const handleTextureDropped = async (file: File) => {
    try {
      setIsGenerating(true);
      setError(null);

      onTextureDropped?.(file);

      // Create image from file
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      // Generate maps with current settings
      const maps = await generateMaps(img, settings);

      // Convert ImageData to URLs for the model viewer
      const mapUrls: TextureMapUrls = {
        albedo: URL.createObjectURL(file),
        normal: maps.normal ? createImageUrl(maps.normal) : '',
        displacement: maps.displacement ? createImageUrl(maps.displacement) : '',
        ao: maps.ao ? createImageUrl(maps.ao) : '',
        specular: maps.specular ? createImageUrl(maps.specular) : ''
      };

      // Notify parent components
      onTextureGenerated?.(maps);
      onTextureApplied?.(mapUrls);

      // Cleanup the temporary URL
      URL.revokeObjectURL(img.src);

    } catch (error) {
      console.error('Error generating texture maps:', error);
      setError('Failed to generate texture maps');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to convert ImageData to URL
  const createImageUrl = (imageData: ImageData): string => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  };

  return (
    <TextureDropzone onTextureDrop={handleTextureDropped}>
      <div className="relative w-full h-full">
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white mt-2">Generating maps...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50">
            <span className="text-white">{error}</span>
          </div>
        )}
      </div>
    </TextureDropzone>
  );
} 