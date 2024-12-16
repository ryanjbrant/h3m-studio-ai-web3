/**
 * SceneBuilder Component
 * A 3D scene viewer and editor that allows loading and manipulating 3D models.
 * Provides a canvas with orbit controls, lighting, and object manipulation capabilities.
 */

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { SceneObject } from './SceneObject';
import { SceneControls } from './SceneControls';
import { TransformMode } from './types';

interface SceneBuilderProps {
  initialModelUrl?: string;
  isMultiView?: boolean;
  displayMode?: 'wireframe' | 'shaded';
}

export interface SceneObjectData {
  id: string;
  type: 'model';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  modelUrl: string;
}

// Scene monitor component
const SceneMonitor = () => {
  const { gl, scene, camera } = useThree();
  
  useEffect(() => {
    console.log('Scene initialized:', {
      renderer: gl,
      scene,
      camera,
      objects: scene.children.length
    });

    const handleContextLost = (event: Event) => {
      console.error('WebGL context lost:', event);
    };

    const handleContextRestored = (event: Event) => {
      console.log('WebGL context restored:', event);
    };

    gl.domElement.addEventListener('webglcontextlost', handleContextLost);
    gl.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      gl.domElement.removeEventListener('webglcontextlost', handleContextLost);
      gl.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl, scene, camera]);

  return null;
};

// Create a context for sharing scene data
const SceneContext = createContext<{
  objects: SceneObjectData[];
  selectedObjectId: string | null;
  transformMode: TransformMode;
  lightIntensity: number;
  displayMode?: 'wireframe' | 'shaded';
  onObjectSelect: (id: string) => void;
  onObjectUpdate: (id: string, updates: Partial<SceneObjectData>) => void;
} | null>(null);

// Custom hook for accessing scene context
const useSceneContext = () => {
  const context = useContext(SceneContext);
  if (!context) throw new Error('useSceneContext must be used within SceneContext.Provider');
  return context;
};

// Shared scene content component
const SharedSceneContent = () => {
  const { objects, selectedObjectId, transformMode, lightIntensity, onObjectSelect, onObjectUpdate } = useSceneContext();
  const { scene } = useThree();

  // Update materials when displayMode changes
  const displayMode = useContext(SceneContext)?.displayMode;
  
  useEffect(() => {
    if (displayMode) {
      scene.traverse((child: THREE.Object3D) => {
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
    }
  }, [displayMode, scene]);

  return (
    <>
      <SceneMonitor />
      {objects.map(object => (
        <SceneObject
          key={object.id}
          object={object}
          isSelected={object.id === selectedObjectId}
          transformMode={transformMode}
          onClick={() => onObjectSelect(object.id)}
          onUpdate={(updates) => onObjectUpdate(object.id, updates)}
        />
      ))}

      {lightIntensity > 0 && (
        <>
          <ambientLight intensity={0.5 * lightIntensity} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={lightIntensity}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
        </>
      )}
      <gridHelper args={[20, 20, '#666666', '#444444']} />
      <Environment preset="studio" background={false} />
    </>
  );
};

// View component for each viewport
const ViewportCanvas = ({ 
  camera, 
  controls = true,
  label 
}: { 
  camera: { position: [number, number, number]; rotation?: [number, number, number]; orthographic?: boolean; zoom?: number; },
  controls?: boolean;
  label: string;
}) => {
  console.log('Initializing viewport:', { label, camera });
  
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
        <SharedSceneContent />
        {camera.orthographic ? (
          <OrthographicCamera 
            makeDefault 
            position={camera.position}
            rotation={camera.rotation}
            zoom={camera.zoom || 100}
            name={label}
          />
        ) : (
          <PerspectiveCamera
            makeDefault
            position={camera.position}
            rotation={camera.rotation}
            fov={45}
            name={label}
          />
        )}
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
      </Canvas>
    </div>
  );
};
export function SceneBuilder({ initialModelUrl, isMultiView = false, displayMode = 'shaded' }: SceneBuilderProps) {
  const [objects, setObjects] = useState<SceneObjectData[]>(() => {
    const initial = initialModelUrl ? [{
      id: 'initial-model',
      type: 'model' as const,
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      modelUrl: initialModelUrl
    }] : [];
    console.log('Initializing scene with objects:', initial);
    return initial;
  });

  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [lightIntensity, setLightIntensity] = useState(1);

  const selectedObject = objects.find(obj => obj.id === selectedObjectId);
  
  const handleObjectUpdate = useCallback((id: string, updates: Partial<SceneObjectData>) => {
    setObjects(prev => prev.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log('Drop event triggered');
    try {
      const data = e.dataTransfer.getData('application/json');
      console.log('Received drop data:', data);
      
      const generation = JSON.parse(data);
      console.log('Parsed generation:', generation);
      
      if (generation.modelUrls?.glb) {
        const newObject: SceneObjectData = {
          id: crypto.randomUUID(),
          type: 'model',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          modelUrl: generation.modelUrls.glb
        };
        console.log('Adding new object to scene:', newObject);
        setObjects(prev => [...prev, newObject]);
      } else {
        console.warn('No GLB URL found in generation data');
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-blue-500');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500');
  }, []);

  const sceneContextValue = {
    objects,
    selectedObjectId,
    transformMode,
    lightIntensity,
    displayMode,
    onObjectSelect: setSelectedObjectId,
    onObjectUpdate: handleObjectUpdate
  };

  useEffect(() => {
    console.log('Scene builder state:', {
      isMultiView,
      objectCount: objects.length,
      selectedObjectId,
      transformMode
    });
  }, [isMultiView, objects, selectedObjectId, transformMode]);

  return (
    <div 
      className="w-full h-full relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <SceneContext.Provider value={sceneContextValue}>
        {isMultiView ? (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1">
            <ViewportCanvas
              label="Perspective"
              camera={{ position: [3, 3, 3] }}
            />
            <ViewportCanvas
              label="Top"
              camera={{ 
                position: [0, 5, 0],
                rotation: [-Math.PI / 2, 0, 0],
                orthographic: true,
                zoom: 100
              }}
            />
            <ViewportCanvas
              label="Front"
              camera={{ 
                position: [0, 0, 5],
                orthographic: true,
                zoom: 100
              }}
            />
            <ViewportCanvas
              label="Right"
              camera={{ 
                position: [5, 0, 0],
                rotation: [0, -Math.PI / 2, 0],
                orthographic: true,
                zoom: 100
              }}
            />
          </div>
        ) : (
          <ViewportCanvas
            label="Perspective"
            camera={{ position: [3, 3, 3] }}
          />
        )}
      </SceneContext.Provider>

      <SceneControls
        selectedObject={selectedObject}
        onObjectUpdate={handleObjectUpdate}
        transformMode={transformMode}
        onTransformModeChange={setTransformMode}
        lightIntensity={lightIntensity}
        onLightIntensityChange={setLightIntensity}
      />
    </div>
  );
} 