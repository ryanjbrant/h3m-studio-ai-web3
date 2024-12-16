import { useState, useCallback } from 'react';
import { LoadedModel } from './LoadedModel';
import { MyModelsSidebar } from './MyModelsSidebar';
import { ModelGenerationPanel } from './ModelGenerationPanel';
import { MeshyPreviewTask } from '../../types/meshy';
import { Controls } from '../Controls';
import { GeneratedMaps } from '../../types/texture';

export function TextTo3D() {
  const [selectedModelUrl, setSelectedModelUrl] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [currentTask, setCurrentTask] = useState<MeshyPreviewTask | undefined>();
  const [generatedMaps, setGeneratedMaps] = useState<{
    normal: ImageData | null;
    displacement: ImageData | null;
    ao: ImageData | null;
    specular: ImageData | null;
  }>({
    normal: null,
    displacement: null,
    ao: null,
    specular: null
  });

  const handleModelUploaded = useCallback((modelUrl: string) => {
    setSelectedModelUrl(modelUrl);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleModelSelected = useCallback((modelUrl: string) => {
    console.log('[TextTo3D] Model selected with URL:', modelUrl);
    console.log('[TextTo3D] Current selectedModelUrl before update:', selectedModelUrl);
    setSelectedModelUrl(modelUrl);
    console.log('[TextTo3D] RefreshTrigger before update:', refreshTrigger);
    setRefreshTrigger(prev => prev + 1);
  }, [selectedModelUrl, refreshTrigger]);

  const handleGenerate = async (settings: any) => {
    setIsGenerating(true);
    setError(undefined);
    try {
      console.log('Generating with settings:', settings);
      return "taskId";
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'Generation failed');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextureGenerated = async (maps: GeneratedMaps) => {
    try {
      setIsGenerating(true);
      setGeneratedMaps(maps);
    } catch (error) {
      console.error('Error handling generated maps:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModelGenerated = useCallback((task: MeshyPreviewTask) => {
    setCurrentTask(task);
  }, []);

  return (
    <div className="w-full h-full flex">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-[#242429] flex flex-col">
        <MyModelsSidebar 
          onModelSelect={handleModelSelected} 
          key={refreshTrigger}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex">
        {/* 3D Viewport with Dropzone */}
        <div className="flex-1">
          {selectedModelUrl ? (
            <>
              {console.log('[TextTo3D] Rendering LoadedModel with URL:', selectedModelUrl)}
              <LoadedModel
                modelUrl={selectedModelUrl}
                onModelUploaded={handleModelUploaded}
                onTextureGenerated={handleTextureGenerated}
                modelType="text-to-3d"
                displayMode="shaded"
                currentView="model"
                lightIntensity={1}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <p>Select a model from the sidebar to view</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-[#242429]">
          {generatedMaps.normal ? (
            <Controls
              maps={generatedMaps}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          ) : (
            <ModelGenerationPanel
              selectedTask={currentTask}
              isGenerating={isGenerating}
              error={error}
              onGenerate={handleGenerate}
              onModelGenerated={handleModelGenerated}
            />
          )}
        </div>
      </div>
    </div>
  );
} 