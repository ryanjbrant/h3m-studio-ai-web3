/**
 * SceneBuilder Component
 * A 3D scene viewer and editor that allows loading and manipulating 3D models.
 * Provides a canvas with orbit controls, lighting, and object manipulation capabilities.
 */

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { SceneObject } from './SceneObject';
import { SceneControls } from './SceneControls';

interface SceneBuilderProps {
  initialModelUrl?: string;  // Optional URL for initial model to load
}

// Defines the structure for 3D objects in the scene
export interface SceneObjectData {
  id: string;
  type: 'model';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  modelUrl: string;
}

export function SceneBuilder({ initialModelUrl }: SceneBuilderProps) {
  console.log('SceneBuilder render:', { initialModelUrl });

  // Initialize scene objects state, optionally with an initial model
  const [objects, setObjects] = useState<SceneObjectData[]>(() => {
    if (initialModelUrl) {
      console.log('Initializing scene with model:', initialModelUrl);
      return [{
        id: 'initial-model',
        type: 'model',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        modelUrl: initialModelUrl
      }];
    }
    console.log('Initializing empty scene');
    return [];
  });

  // Track selected object for manipulation
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  // Handle updates to object properties (position, rotation, scale)
  const handleObjectUpdate = (id: string, updates: Partial<SceneObjectData>) => {
    console.log('Updating object:', { id, updates });
    setObjects(prev => prev.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ));
  };

  return (
    <div className="w-full h-full relative">
      {/* Main 3D Canvas with camera and renderer settings */}
      <Canvas
        shadows
        camera={{ position: [5, 5, 5], fov: 45 }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        {/* Render all scene objects */}
        {objects.map(object => (
          <SceneObject
            key={object.id}
            object={object}
            isSelected={object.id === selectedObjectId}
            onClick={() => setSelectedObjectId(object.id)}
            onUpdate={(updates) => handleObjectUpdate(object.id, updates)}
          />
        ))}

        {/* Scene lighting and environment setup */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <gridHelper args={[20, 20, '#666666', '#444444']} />
        <Environment preset="studio" background={false} />
        
        {/* Camera controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={20}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* UI controls for selected object manipulation */}
      <SceneControls
        selectedObject={selectedObject}
        onObjectUpdate={handleObjectUpdate}
      />
    </div>
  );
} 