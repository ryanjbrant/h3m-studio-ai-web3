import React, { useState, useEffect } from 'react';
import { Controls } from '../components/Controls';
import { Preview3D } from '../components/Preview3D';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { useTextureStore } from '../store/textureStore';
import { generateMaps, GeneratedMaps } from '../utils/textureGenerator';

const TextureGenerator: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [generatedMaps, setGeneratedMaps] = useState<GeneratedMaps | null>(null);
  const { settings } = useTextureStore();

  const handleFileSelect = async (file: File) => {
    if (isValidFile(file)) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => (img.onload = resolve));
      setSourceImage(img);
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    return validTypes.includes(file.type) && file.size <= maxSize;
  };

  useEffect(() => {
    if (sourceImage) {
      generateMaps(sourceImage, settings).then((maps) => {
        setGeneratedMaps(maps);
      });
    } else {
      setGeneratedMaps(null);
    }
  }, [sourceImage, settings]);

  return (
    <div className="h-[calc(100vh-44px)] flex flex-col">
      <header className="flex justify-between items-center p-4 flex-shrink-0">
        <h1 className="text-2xl font-bold">Texture Map Generator</h1>
        <ThemeSwitcher />
      </header>

      <main className="flex-1 min-h-0 p-4">
        <div className="flex gap-4 h-full">
          <div className="w-2/3 h-full">
            <Preview3D
              maps={generatedMaps}
              onFileSelect={handleFileSelect}
              sourceImage={sourceImage}
            />
          </div>
          <div className="w-1/3 h-full">
            {generatedMaps ? (
              <Controls maps={generatedMaps} />
            ) : (
              <div className="w-full h-full bg-[rgb(var(--muted))] rounded-lg flex items-center justify-center text-[rgb(var(--muted-foreground))]">
                <p>Drag and drop a texture onto the 3D preview</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TextureGenerator;