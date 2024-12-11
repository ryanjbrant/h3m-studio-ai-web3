import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createImageTo3DTask, getTaskStatus } from '../../services/meshyApi';
import { MeshyPreviewTask } from '../../types/meshy';

interface ImageTo3DProps {
  isOpen: boolean;
  onClose: () => void;
  onModelGenerated: (task: MeshyPreviewTask) => void;
}

export function ImageTo3D({ isOpen, onClose, onModelGenerated }: ImageTo3DProps) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });

  const handleGenerate = async () => {
    if (!image) return;
    
    try {
      setIsGenerating(true);
      setProgress(0);
      setError(null);

      const taskId = await createImageTo3DTask(image, {
        topology: 'quad',
        targetPolycount: 50000 // High quality
      });

      let currentTask;
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        currentTask = await getTaskStatus(taskId);
        
        if (currentTask.status === 'FAILED') {
          throw new Error(currentTask.task_error?.message || 'Generation failed');
        }
        
        if (currentTask.status === 'SUCCEEDED') {
          onModelGenerated(currentTask);
          onClose();
          break;
        }
        
        setProgress(currentTask.progress);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate 3D model');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className={cn(
      'fixed right-0 top-0 h-full w-80 bg-[#121214] border-l border-[#242429] transform transition-transform duration-300 ease-in-out z-50',
      isOpen ? 'translate-x-0' : 'translate-x-full'
    )}>
      <div className="flex flex-col h-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Image to 3D</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#242429] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
              isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-[#242429] hover:border-[#363639]',
              preview ? 'border-solid' : 'border-dashed'
            )}
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="relative aspect-square">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/75 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8">
                {isDragActive ? (
                  <ImageIcon className="w-12 h-12 text-blue-500" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400" />
                )}
                <p className="text-sm text-gray-400">
                  {isDragActive
                    ? 'Drop the image here'
                    : 'Drag & drop an image or click to browse'}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {isGenerating && (
            <div className="space-y-2">
              <div className="h-2 bg-[#242429] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 text-center">{progress}%</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!image || isGenerating}
            className={cn(
              'w-full py-2 px-4 rounded-lg font-medium transition-colors',
              image && !isGenerating
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-[#242429] text-gray-400 cursor-not-allowed'
            )}
          >
            {isGenerating ? 'Generating...' : 'Generate 3D Model'}
          </button>
        </div>
      </div>
    </div>
  );
} 