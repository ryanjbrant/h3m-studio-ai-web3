import React, { useCallback } from 'react';

interface DownloadDropdownProps {
  imageData: ImageData;
  mapType: string;
  onClose: () => void;
}

export const DownloadDropdown: React.FC<DownloadDropdownProps> = ({
  imageData,
  mapType,
  onClose,
}) => {
  const sizes = [512, 1024, 2048, 4096];

  const handleDownload = useCallback((size: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size to desired export size
    canvas.width = size;
    canvas.height = size;
    
    // Create temporary canvas with original image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.putImageData(imageData, 0, 0);
    
    // Scale image to desired size
    ctx.drawImage(tempCanvas, 0, 0, size, size);
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${mapType}_${size}px.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onClose();
    }, 'image/png');
  }, [imageData, mapType, onClose]);

  return (
    <div className="absolute top-full left-0 mt-2 w-48 bg-[#2a2a2f] rounded-lg shadow-lg overflow-hidden z-10">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => handleDownload(size)}
          className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#3a3a3f] hover:text-white transition-colors text-left"
        >
          {size}x{size}px
        </button>
      ))}
    </div>
  );
};