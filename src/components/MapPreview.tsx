import React from 'react';

interface MapPreviewProps {
  imageData: ImageData;
}

export const MapPreview: React.FC<MapPreviewProps> = ({ imageData }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvasRef.current && imageData) {
      const ctx = canvasRef.current.getContext('2d')!;
      canvasRef.current.width = imageData.width;
      canvasRef.current.height = imageData.height;
      ctx.putImageData(imageData, 0, 0);
    }
  }, [imageData]);

  return (
    <div className="relative pb-[100%] bg-[#121214]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};