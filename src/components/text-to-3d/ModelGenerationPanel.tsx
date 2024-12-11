import { useState } from 'react';
import { cn } from '../../lib/utils';
import { GenerationControls } from './GenerationControls';
import { MeshyPreviewTask } from '../../types/meshy';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X, Send } from 'lucide-react';
import { createImageTo3DTask, getTaskStatus } from '../../services/meshyApi';
import { saveGeneration } from '../../services/storage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface GenerationSettings {
  prompt: string;
  artStyle?: string;
  negativePrompt?: string;
  topology?: 'quad' | 'triangle';
  targetPolycount?: 'adaptive' | 'low' | 'medium' | 'high' | 'ultra';
  seed?: number;
}

interface ModelGenerationPanelProps {
  selectedTask?: MeshyPreviewTask;
  isGenerating: boolean;
  error?: string;
  onGenerate: (settings: GenerationSettings) => Promise<string>;
  onTaskSelect?: (task: MeshyPreviewTask) => void;
  onModelGenerated: (task: MeshyPreviewTask) => void;
}

type Tab = 'text' | 'image';

export function ModelGenerationPanel({ 
  onModelGenerated,
  onGenerate,
  isGenerating,
  error,
  selectedTask,
  onTaskSelect
}: ModelGenerationPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageProgress, setImageProgress] = useState(0);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setImageError('Image size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setImageError('Please upload an image file');
        return;
      }

      setImage(file);
      setPreview(URL.createObjectURL(file));
      setImageError(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });

  const handleGenerate = async (settings: GenerationSettings) => {
    if (!user) return;
    
    try {
      console.log('Starting generation with settings:', settings);
      const taskId = await onGenerate(settings);
      console.log('Generation task created:', taskId);

      // Start polling for task status
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const task = await getTaskStatus(taskId);
        console.log('Task status update:', task);
        
        if (!task) {
          throw new Error('Failed to get task status');
        }
        
        if (task.status === 'FAILED') {
          throw new Error(task.task_error?.message || 'Generation failed');
        }
        
        // Update UI with current task progress
        onModelGenerated(task);
        
        if (task.status === 'SUCCEEDED') {
          await saveGeneration(user.uid, task, 'text', settings.prompt);
          break;
        }
      }
    } catch (err) {
      console.error('Generation error:', err);
      setImageError(err instanceof Error ? err.message : 'Failed to generate model');
    }
  };

  const handleImageGenerate = async () => {
    if (!image || !user) return;
    
    try {
      setIsImageGenerating(true);
      setImageProgress(0);
      setImageError(null);

      console.log('Starting image-to-3D generation');
      const taskId = await createImageTo3DTask(image, {
        topology: 'quad',
        targetPolycount: 50000
      });
      console.log('Image-to-3D task created:', taskId);

      let currentTask;
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        currentTask = await getTaskStatus(taskId);
        console.log('Task status update:', currentTask);
        
        if (currentTask.status === 'FAILED') {
          throw new Error(currentTask.task_error?.message || 'Generation failed');
        }
        
        if (currentTask.status === 'SUCCEEDED') {
          await saveGeneration(user.uid, currentTask, 'image', imagePrompt);
          onModelGenerated(currentTask);
          break;
        }
        
        setImageProgress(currentTask.progress);
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setImageError(err instanceof Error ? err.message : 'Failed to generate 3D model');
    } finally {
      setIsImageGenerating(false);
      setImageProgress(0);
    }
  };

  const handleSendToScene = () => {
    if (selectedTask) {
      localStorage.setItem('sceneBuilderModel', JSON.stringify({
        modelUrl: selectedTask.model_urls.glb,
        timestamp: Date.now()
      }));
      navigate('/tools/scene-builder');
    }
  };

  const handleViewModel = () => {
    if (selectedTask) {
      onTaskSelect?.(selectedTask);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-[#242429]">
        <button
          onClick={() => setActiveTab('text')}
          className={cn(
            'flex-1 px-3 py-2 text-sm font-medium transition-colors',
            activeTab === 'text' 
              ? 'bg-[#242429] text-white' 
              : 'text-gray-400 hover:text-white hover:bg-[#1a1a1f]'
          )}
        >
          Text to 3D
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={cn(
            'flex-1 px-3 py-2 text-sm font-medium transition-colors border-l border-[#242429]',
            activeTab === 'image' 
              ? 'bg-[#242429] text-white' 
              : 'text-gray-400 hover:text-white hover:bg-[#1a1a1f]'
          )}
        >
          Image to 3D
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'text' ? (
          <div>
            <GenerationControls 
              onGenerate={(settings) => handleGenerate(settings)}
              disabled={isGenerating}
            />

            {error && (
              <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-400 mt-4">
                {error}
              </div>
            )}

            {isGenerating && (
              <div className="mt-4 space-y-2">
                <div className="h-2 bg-[#242429] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${selectedTask?.progress || 0}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  {selectedTask?.progress || 0}% - Generating your 3D model...
                </p>
              </div>
            )}

            {selectedTask?.status === 'SUCCEEDED' && (
              <button
                onClick={handleSendToScene}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#242429] text-white rounded-md font-medium hover:bg-[#2a2a2f] transition-colors"
              >
                <Send className="w-4 h-4" />
                Send to Scene
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prompt</label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a0b] border border-[#242429] rounded-md text-white resize-none"
                rows={4}
                maxLength={500}
                placeholder="Describe any additional details for the 3D model generation"
                disabled={isImageGenerating}
              />
              <div className="mt-1 text-xs text-gray-400 text-right">
                {imagePrompt.length}/500
              </div>
            </div>

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

            {imageError && (
              <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-400 text-sm">
                {imageError}
              </div>
            )}

            {isImageGenerating && (
              <div className="space-y-2">
                <div className="h-2 bg-[#242429] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${imageProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 text-center">{imageProgress}%</p>
              </div>
            )}

            <button
              onClick={handleImageGenerate}
              disabled={!image || isImageGenerating}
              className={cn(
                'w-full px-4 py-2 bg-blue-500 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors'
              )}
            >
              {isImageGenerating ? 'Generating...' : 'Generate 3D Model'}
            </button>

            {selectedTask?.status === 'SUCCEEDED' && (
              <div className="space-y-2">
                <button
                  onClick={handleViewModel}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
                >
                  View Model
                </button>
                <button
                  onClick={handleSendToScene}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#242429] text-white rounded-md font-medium hover:bg-[#2a2a2f] transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send to Scene
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 