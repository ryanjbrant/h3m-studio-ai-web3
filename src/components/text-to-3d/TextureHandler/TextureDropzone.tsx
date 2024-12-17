import { useEffect, useRef } from 'react';

interface TextureDropzoneProps {
  onTextureDrop: (file: File) => Promise<void>;
  children: React.ReactNode;
}

export function TextureDropzone({ onTextureDrop, children }: TextureDropzoneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const isImageFile = (file: File) => /\.(png|jpe?g|webp)$/i.test(file.name);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleDrop = async (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      const file = event.dataTransfer?.files[0];
      if (!file) return;

      if (isImageFile(file)) {
        onTextureDrop(file);
      }
    };

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragover', handleDragOver);

    return () => {
      container.removeEventListener('drop', handleDrop);
      container.removeEventListener('dragover', handleDragOver);
    };
  }, [onTextureDrop]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {children}
    </div>
  );
} 