import * as THREE from 'three';
import { useEffect, Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { ErrorBoundary } from '../ErrorBoundary';
import { SceneBuilder } from '../scene-builder/SceneBuilder';
import { Layout, Box, Boxes, Layers, SunMedium } from 'lucide-react';
import { cn } from '../../lib/utils';

// Make THREE available globally before any other imports or usage
if (typeof window !== 'undefined' && !(window as any).THREE) {
  (window as any).THREE = THREE;
}

// Define component prop interfaces
interface LoadedModelProps {
  modelUrl?: string;
  displayMode?: 'wireframe' | 'shaded';
  lightIntensity?: number;
  currentView?: 'model' | 'scene';
  onModelUploaded?: (modelUrl: string) => void;
  onTextureGenerated?: (maps: any) => void;
  modelType?: string;
}

interface ModelProps {
  url: string;
  displayMode: 'wireframe' | 'shaded';
}

// Model component for rendering 3D models
function Model({ url, displayMode }: ModelProps) {
  const model = useGLTF(url);

  useEffect(() => {
    // Update material mode when displayMode changes
    model.scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(material => {
          if (material) {
            material.wireframe = displayMode === 'wireframe';
            material.needsUpdate = true;
          }
        });
      }
    });
  }, [displayMode, model.scene]);

  return (
    <primitive 
      object={model.scene} 
      position={[0, 0, 0]}
      scale={1}
      onUpdate={(self: THREE.Object3D) => {
        // Center the model
        const box = new THREE.Box3().setFromObject(self);
        const center = box.getCenter(new THREE.Vector3());
        self.position.sub(center);
        
        // Enable shadows
        self.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }}
    />
  );
}

// ViewportCanvas component for rendering 3D viewport
const ViewportCanvas = ({ 
  camera, 
  controls = true,
  label,
  modelUrl,
  displayMode
}: {
  camera: {
    position: [number, number, number];
    rotation?: [number, number, number];
    orthographic?: boolean;
    zoom?: number;
  };
  controls?: boolean;
  label: string;
  modelUrl: string;
  displayMode: 'wireframe' | 'shaded';
}) => {
  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded z-10">{label}</div>
      <Canvas
        shadows
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        camera={{
          ...camera,
          near: 0.1,
          far: 1000,
          fov: 45
        }}
      >
        <ErrorBoundary
          FallbackComponent={({ error }) => (
            <Html center>
              <div className="text-red-500 bg-black/50 p-2 rounded">
                Error: {error.message}
              </div>
            </Html>
          )}
        >
          <Suspense fallback={
            <Html center>
              <div className="flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-white">Loading model...</p>
              </div>
            </Html>
          }>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            {controls && (
              <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.05}
                minDistance={1}
                maxDistance={10}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 2}
                enableRotate={!camera.orthographic}
                enableZoom={true}
                target={[0, 0, 0]}
              />
            )}
            {modelUrl && <Model url={modelUrl} displayMode={displayMode} />}
          </Suspense>
        </ErrorBoundary>
      </Canvas>
    </div>
  );
};

function ModelViewer({ 
  modelUrl, 
  displayMode, 
  isMultiView
}: { 
  modelUrl: string; 
  displayMode: 'wireframe' | 'shaded';
  isMultiView: boolean;
}) {
  // Configure viewport views
  const views = useMemo(() => {
    if (!isMultiView) {
      return [{
        label: "Perspective",
        camera: { position: [3, 3, 3] as [number, number, number] }
      }];
    }

    return [
      {
        label: "Perspective",
        camera: { position: [3, 3, 3] as [number, number, number] }
      },
      {
        label: "Top",
        camera: { 
          position: [0, 5, 0] as [number, number, number],
          rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
          orthographic: true,
          zoom: 100
        }
      },
      {
        label: "Front",
        camera: { 
          position: [0, 0, 5] as [number, number, number],
          orthographic: true,
          zoom: 100
        }
      },
      {
        label: "Right",
        camera: { 
          position: [5, 0, 0] as [number, number, number],
          rotation: [0, -Math.PI / 2, 0] as [number, number, number],
          orthographic: true,
          zoom: 100
        }
      }
    ];
  }, [isMultiView]);

  return (
    <div className={cn(
      "w-full h-full",
      isMultiView ? "grid grid-cols-2 grid-rows-2 gap-1" : ""
    )}>
      {views.map((view, index) => (
        <ViewportCanvas
          key={`${view.label}-${index}`}
          label={view.label}
          camera={view.camera}
          modelUrl={modelUrl}
          displayMode={displayMode}
        />
      ))}
    </div>
  );
}

export function LoadedModel({
  modelUrl,
  displayMode = 'shaded',
  currentView = 'model'
}: LoadedModelProps) {
  const [viewMode, setViewMode] = useState<'model' | 'scene'>(currentView);
  const [materialMode, setMaterialMode] = useState<'wireframe' | 'shaded'>(displayMode);
  const [isMultiView, setIsMultiView] = useState(false);

  // Preload model
  useEffect(() => {
    if (modelUrl) {
      useGLTF.preload(modelUrl);
    }
    return () => {
      if (modelUrl) {
        useGLTF.clear(modelUrl);
      }
    };
  }, [modelUrl]);

  // Update material mode when displayMode prop changes
  useEffect(() => {
    setMaterialMode(displayMode);
  }, [displayMode]);

  return (
    <div className="flex flex-1 h-full relative">
      <div className="flex-1 relative">
        {/* Unified Toolbar */}
        <div className="absolute top-0 left-0 right-0 z-50 p-2 bg-black/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            {/* View Controls Group */}
            <div className="flex items-center gap-2 px-2 py-1 bg-black/20 rounded-lg">
              <span className="text-xs text-gray-400 font-medium">View</span>
              <div className="w-px h-4 bg-gray-700" />
              <button
                onClick={() => setViewMode('model')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors',
                  viewMode === 'model' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                )}
              >
                <Boxes className="w-4 h-4" />
                Model
              </button>
              <button
                onClick={() => setViewMode('scene')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors',
                  viewMode === 'scene' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                )}
              >
                <Box className="w-4 h-4" />
                Scene
              </button>
            </div>

            {/* Material Controls Group */}
            <div className="flex items-center gap-2 px-2 py-1 bg-black/20 rounded-lg">
              <span className="text-xs text-gray-400 font-medium">Material</span>
              <div className="w-px h-4 bg-gray-700" />
              <button
                onClick={() => setMaterialMode('shaded')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors',
                  materialMode === 'shaded' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                )}
              >
                <SunMedium className="w-4 h-4" />
                Shaded
              </button>
              <button
                onClick={() => setMaterialMode('wireframe')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors',
                  materialMode === 'wireframe' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                )}
              >
                <Layers className="w-4 h-4" />
                Wireframe
              </button>
            </div>

            {/* Layout Controls Group */}
            <div className="flex items-center gap-2 px-2 py-1 bg-black/20 rounded-lg">
              <span className="text-xs text-gray-400 font-medium">Layout</span>
              <div className="w-px h-4 bg-gray-700" />
              <button
                onClick={() => setIsMultiView(prev => !prev)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors',
                  isMultiView ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                )}
              >
                <Layout className="w-4 h-4" />
                {isMultiView ? 'Single View' : '4-Up View'}
              </button>
            </div>
          </div>
        </div>

        <ErrorBoundary
          FallbackComponent={({ error }) => (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
              <p className="text-red-400 text-sm">Error loading model: {error.message}</p>
            </div>
          )}
        >
          {viewMode === 'model' ? (
            <ModelViewer 
              modelUrl={modelUrl || ''} 
              displayMode={materialMode}
              isMultiView={isMultiView}
            />
          ) : (
            <div className="w-full h-full">
              <SceneBuilder 
                initialModelUrl={modelUrl} 
                isMultiView={isMultiView}
                displayMode={materialMode}
              />
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}