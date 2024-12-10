import React, { useState, Suspense } from 'react';
import { createPreviewTask, getTaskStatus } from '../services/meshyApi';
import { ModelViewer } from '../components/text-to-3d/ModelViewer';
import { GenerationControls } from '../components/text-to-3d/GenerationControls';
import { GenerationHistory } from '../components/text-to-3d/GenerationHistory';
import { TaskProgress } from '../components/text-to-3d/TaskProgress';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { MeshyPreviewTask } from '../types/meshy';

interface GenerationSettings {
  prompt: string;
  symmetry: 'off' | 'auto' | 'on';
  useFixedSeed: boolean;
  seed?: number;
  targetPolycount: 'adaptive' | 'low' | 'medium' | 'high' | 'ultra';
  topology: 'quad' | 'triangle';
}

const TextTo3D: React.FC = () => {
  const [tasks, setTasks] = useState<MeshyPreviewTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTask = tasks.find(task => task.id === selectedTaskId);
  const modelUrl = selectedTask?.status === 'SUCCEEDED' ? selectedTask.model_urls.glb : null;

  const getPolycountValue = (setting: string): number | undefined => {
    const values = {
      low: 10000,
      medium: 30000,
      high: 50000,
      ultra: 100000
    };
    return setting === 'adaptive' ? undefined : values[setting as keyof typeof values];
  };

  const handleGenerate = async (settings: GenerationSettings) => {
    try {
      setIsGenerating(true);
      setError(null);
      setSelectedTaskId(null);
      
      const taskId = await createPreviewTask(
        settings.prompt,
        'realistic',
        undefined,
        settings.topology,
        getPolycountValue(settings.targetPolycount),
        settings.useFixedSeed ? settings.seed : undefined
      );

      const initialTask: MeshyPreviewTask = {
        id: taskId,
        prompt: settings.prompt,
        status: 'PENDING',
        progress: 0,
        model_urls: { glb: '', fbx: '', usdz: '', obj: '', mtl: '' },
        thumbnail_url: '',
        video_url: '',
        art_style: 'realistic',
        negative_prompt: '',
        started_at: Date.now(),
        created_at: Date.now(),
        finished_at: 0,
        texture_urls: []
      };

      setTasks(prev => [initialTask, ...prev]);

      let currentTask = initialTask;
      while (currentTask.status === 'PENDING' || currentTask.status === 'IN_PROGRESS') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        currentTask = await getTaskStatus(taskId);
        setTasks(prev => prev.map(task => 
          task.id === taskId ? currentTask : task
        ));
      }

      if (currentTask.status === 'FAILED') {
        throw new Error(currentTask.task_error?.message || 'Generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-[calc(100vh-44px)] flex flex-col">
      <main className="flex-1 min-h-0 p-4">
        <div className="flex gap-4 h-full">
          <GenerationHistory
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={(task: MeshyPreviewTask) => {
              if (task.status === 'SUCCEEDED') {
                setSelectedTaskId(task.id);
              }
            }}
          />

          <div className="flex-1 h-full bg-[#121214] rounded-lg border border-[#242429] overflow-hidden">
            <ErrorBoundary FallbackComponent={({ error }) => (
              <div className="w-full h-full flex items-center justify-center text-red-400">
                <p>Error loading model: {error.message}</p>
              </div>
            )}>
              <Suspense fallback={<LoadingSpinner />}>
                <ModelViewer modelUrl={modelUrl} />
              </Suspense>
            </ErrorBoundary>
          </div>

          <div className="w-80 h-full space-y-4">
            <GenerationControls 
              onGenerate={handleGenerate}
              disabled={isGenerating}
            />

            {error && (
              <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}

            {isGenerating && selectedTask && (
              <TaskProgress progress={selectedTask.progress} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TextTo3D;