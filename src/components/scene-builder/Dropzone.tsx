import React, { useCallback, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useSceneStore } from '../../store/sceneStore';

export const Dropzone: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addObject = useSceneStore((state) => state.addObject);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setIsLoading(true);

    const files = Array.from(e.dataTransfer.files);
    const validExtensions = ['.fbx', '.obj', '.gltf', '.glb', '.usdz'];
    
    try {
      for (const file of files) {
        const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (validExtensions.includes(extension)) {
          const objectUrl = URL.createObjectURL(file);
          
          addObject({
            id: crypto.randomUUID(),
            name: file.name,
            type: extension.slice(1),
            url: objectUrl,
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
          });
        } else {
          setError(`Unsupported file type: ${extension}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model');
    } finally {
      setIsLoading(false);
    }
  }, [addObject]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="absolute inset-0 pointer-events-auto"
    >
      {!isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="p-8 rounded-lg border-2 border-dashed border-[#242429] bg-[#121214]/50">
            {isLoading ? (
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4 mx-auto" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
            )}
            <p className="text-gray-400 text-center">
              {error ? (
                <span className="text-red-400">{error}</span>
              ) : (
                <>
                  Drag and drop 3D models here<br />
                  <span className="text-sm">(.fbx, .obj, .gltf, .glb, .usdz)</span>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};