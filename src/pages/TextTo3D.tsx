import React, { useState, useEffect } from 'react';
import { createPreviewTask } from '../services/meshyApi';
import { LoadedModel } from '../components/text-to-3d/LoadedModel';
import { MeshyPreviewTask } from '../types/meshy';
import { ModelGenerationPanel } from '../components/text-to-3d/ModelGenerationPanel';
import { GenerationHistorySidebar } from '../components/text-to-3d/GenerationHistorySidebar';
import { GenerationData } from '../types/generation';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';

interface GenerationSettings {
  prompt: string;
  artStyle?: string;
  negativePrompt?: string;
  topology?: 'quad' | 'triangle';
  targetPolycount?: 'adaptive' | 'low' | 'medium' | 'high' | 'ultra';
  seed?: number;
  symmetry?: boolean;
  useFixedSeed?: boolean;
}

const TextTo3D: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<MeshyPreviewTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>(undefined);
  const [sceneTransitionError, setSceneTransitionError] = useState<string | undefined>(undefined);

  const selectedTask = tasks.find(task => task.id === selectedTaskId);
  const currentTask = tasks.find(task => task.id === currentTaskId);

  // Debug logging for task state changes
  useEffect(() => {
    console.log('Task state updated:', {
      selectedTaskId,
      currentTaskId,
      selectedTask: selectedTask ? {
        id: selectedTask.id,
        status: selectedTask.status,
        modelUrls: selectedTask.model_urls,
        shouldShowButton: selectedTask.status === 'SUCCEEDED'
      } : null,
      currentTask: currentTask ? {
        id: currentTask.id,
        status: currentTask.status,
        modelUrls: currentTask.model_urls
      } : null,
      allTasks: tasks.map(t => ({
        id: t.id,
        status: t.status
      }))
    });
  }, [tasks, selectedTaskId, currentTaskId, selectedTask, currentTask]);

  const getPolycountValue = (setting?: string): number | undefined => {
    if (!setting || setting === 'adaptive') return undefined;
    const values = {
      low: 10000,
      medium: 30000,
      high: 50000,
      ultra: 100000
    };
    return values[setting as keyof typeof values];
  };

  const handleGenerate = async (settings: GenerationSettings): Promise<string> => {
    try {
      console.log('Starting text-to-3D generation:', settings);
      setIsGenerating(true);
      setError(undefined);
      
      const taskId = await createPreviewTask(
        settings.prompt,
        settings.artStyle || 'realistic',
        settings.negativePrompt || '',
        settings.topology || 'quad',
        getPolycountValue(settings.targetPolycount),
        settings.useFixedSeed ? settings.seed : undefined
      );
      
      console.log('Task created:', taskId);
      
      // Add placeholder task immediately
      const placeholderTask: MeshyPreviewTask = {
        id: taskId,
        model_urls: { glb: '' },
        thumbnail_url: '',
        prompt: settings.prompt,
        art_style: settings.artStyle || 'realistic',
        negative_prompt: settings.negativePrompt || '',
        progress: 0,
        status: 'PENDING',
        started_at: Date.now(),
        created_at: Date.now(),
        finished_at: 0,
        texture_urls: []
      };
      setTasks(prev => [placeholderTask, ...prev]);
      setCurrentTaskId(taskId);
      return taskId;
    } catch (err) {
      console.error('Text-to-3D generation error:', err);
      const message = err instanceof Error ? err.message : 'Failed to generate model';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTaskComplete = (task: MeshyPreviewTask) => {
    console.log('Task completed:', {
      id: task.id,
      status: task.status,
      modelUrls: task.model_urls
    });
    setTasks(prev => {
      const existingTaskIndex = prev.findIndex(t => t.id === task.id);
      if (existingTaskIndex >= 0) {
        const newTasks = [...prev];
        newTasks[existingTaskIndex] = task;
        return newTasks;
      }
      return [task, ...prev];
    });
    setCurrentTaskId(task.id);
    setIsGenerating(task.status !== 'SUCCEEDED' && task.status !== 'FAILED');
  };

  const handleSelectGeneration = (generation: GenerationData) => {
    console.log('Selected generation:', {
      id: generation.id,
      status: generation.status,
      modelUrls: generation.modelUrls
    });
    
    // Convert GenerationData to MeshyPreviewTask format
    const task: MeshyPreviewTask = {
      id: generation.id,
      model_urls: {
        glb: generation.modelUrls.glb || '',
        fbx: generation.modelUrls.fbx || '',
        usdz: generation.modelUrls.usdz || ''
      },
      thumbnail_url: generation.thumbnailUrl || '',
      prompt: generation.prompt || '',
      art_style: 'realistic',
      negative_prompt: '',
      progress: 100,
      status: generation.status === 'complete' ? 'SUCCEEDED' : 
              generation.status === 'failed' ? 'FAILED' : 'PENDING',
      started_at: generation.timestamp.toMillis(),
      created_at: generation.timestamp.toMillis(),
      finished_at: generation.timestamp.toMillis(),
      texture_urls: []
    };
    
    console.log('Converted to task:', {
      id: task.id,
      status: task.status,
      modelUrls: task.model_urls,
      shouldShowButton: task.status === 'SUCCEEDED'
    });
    
    setTasks(prev => [task, ...prev.filter(t => t.id !== task.id)]);
    setSelectedTaskId(task.id);
  };

  const handleSelectTask = (task: MeshyPreviewTask) => {
    console.log('Selecting task:', {
      id: task.id,
      status: task.status,
      modelUrls: task.model_urls,
      shouldShowButton: task.status === 'SUCCEEDED'
    });
    setSelectedTaskId(task.id);
  };

  const handleSendToScene = () => {
    try {
      if (!selectedTask) {
        throw new Error('No task selected');
      }
      
      if (!selectedTask.model_urls.glb) {
        throw new Error('No GLB model URL available');
      }

      const sceneData = {
        modelUrl: selectedTask.model_urls.glb,
        timestamp: Date.now()
      };
      
      console.log('Sending to scene:', {
        ...sceneData,
        taskStatus: selectedTask.status,
        taskId: selectedTask.id
      });
      
      localStorage.setItem('sceneBuilderModel', JSON.stringify(sceneData));
      navigate('/tools/scene-builder');
    } catch (err) {
      console.error('Error sending to scene:', err);
      setSceneTransitionError(err instanceof Error ? err.message : 'Failed to send to scene');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4">
      <div className="flex h-full bg-[#0a0a0b] rounded-lg overflow-hidden">
        <div className="w-80 min-w-[320px] border-r border-[#242429] h-full overflow-y-auto">
          <GenerationHistorySidebar 
            onSelectGeneration={handleSelectGeneration} 
            currentTask={currentTask}
          />
        </div>
        <div className="flex-1 h-full min-w-0 relative">
          <LoadedModel modelUrl={selectedTask?.model_urls.glb} />
          {selectedTask?.status === 'SUCCEEDED' ? (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <button
                onClick={handleSendToScene}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                <Send className="w-4 h-4" />
                Send to Scene
              </button>
            </div>
          ) : (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
              {selectedTask ? `Current status: ${selectedTask.status}` : 'No model selected'}
            </div>
          )}
          {sceneTransitionError && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              <div className="bg-red-500/10 border border-red-500 rounded-lg px-4 py-2 text-red-400">
                {sceneTransitionError}
              </div>
            </div>
          )}
        </div>
        <div className="w-96 min-w-[384px] border-l border-[#242429] h-full overflow-y-auto">
          <ModelGenerationPanel
            selectedTask={currentTask}
            isGenerating={isGenerating}
            error={error}
            onGenerate={handleGenerate}
            onModelGenerated={handleTaskComplete}
            onTaskSelect={handleSelectTask}
          />
        </div>
      </div>
    </div>
  );
};

export default TextTo3D;