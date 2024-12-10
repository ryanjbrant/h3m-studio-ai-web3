import React, { useRef } from 'react';
import { Upload, Loader } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useTextureStore } from '../store/textureStore';

interface UploadButtonProps {
  onUploadComplete?: (url: string) => void;
  className?: string;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  onUploadComplete,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, error } = useFileUpload();
  const { settings } = useTextureStore();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await upload(file, settings, {
        storageProvider: 's3',
        preserveOriginalName: true
      });

      if (result && onUploadComplete) {
        onUploadComplete(result.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }

    // Reset input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.webp,.tiff"
        onChange={handleFileChange}
      />
      <button
        onClick={handleClick}
        disabled={uploading}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {uploading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && (
        <p className="absolute top-full left-0 mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};