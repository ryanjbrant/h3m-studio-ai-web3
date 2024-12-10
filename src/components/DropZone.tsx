import React, { useCallback, useState } from 'react';
import { Upload, Loader } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAuthStore } from '../store/authStore';
import { useTextureStore } from '../store/textureStore';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { user } = useAuthStore();
  const { settings } = useTextureStore();
  const { upload, uploading, error } = useFileUpload();

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && isValidFile(file)) {
        onFileSelect(file);

        if (user) {
          try {
            await upload(file, settings, {
              storageProvider: 's3',
              generateThumbnail: true,
              preserveOriginalName: false
            });
          } catch (error) {
            console.error('Upload failed:', error);
          }
        }
      }
    },
    [onFileSelect, user, upload, settings]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && isValidFile(file)) {
        onFileSelect(file);

        if (user) {
          try {
            await upload(file, settings, {
              storageProvider: 's3',
              generateThumbnail: true,
              preserveOriginalName: false
            });
          } catch (error) {
            console.error('Upload failed:', error);
          }
        }
      }
    },
    [onFileSelect, user, upload, settings]
  );

  const isValidFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a JPG, PNG, TIFF, or WebP file.');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 50MB.');
      return false;
    }
    
    return true;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div
      className={`w-[800px] h-[400px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-[#1a1a1f] cursor-pointer transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-500/5'
          : 'border-gray-600 hover:border-blue-500 hover:bg-[#242429]'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-16 h-16 text-blue-500 animate-spin" />
          <p className="text-lg text-gray-300">Uploading texture...</p>
        </div>
      ) : (
        <>
          <Upload className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-lg text-gray-300 mb-2">
            Drag and drop your texture image here
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Supported formats: JPG, PNG, TIFF, WebP (Max 50MB)
          </p>
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept=".jpg,.jpeg,.png,.tiff,.webp"
            onChange={handleFileInput}
          />
          <label
            htmlFor="fileInput"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Select File
          </label>
        </>
      )}
      
      {error && (
        <p className="mt-4 text-sm text-red-500">
          {error}
        </p>
      )}

      {!user && (
        <p className="mt-4 text-sm text-gray-400">
          Sign in to save your textures
        </p>
      )}
    </div>
  );
};