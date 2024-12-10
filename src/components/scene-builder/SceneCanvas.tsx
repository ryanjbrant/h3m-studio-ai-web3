import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, TransformControls } from '@react-three/drei';
import { Dropzone } from './Dropzone';
import { useSceneStore } from '../../store/sceneStore';
import { useLightingStore } from '../../store/lightingStore';
import { SceneObject } from './SceneObject';
import { SceneLight } from './SceneLight';
import { ObjectList } from './ObjectList';
import { LightingControls } from './LightingControls';

export const SceneCanvas: React.FC = () => {
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const { objects, selectedObjectId } = useSceneStore();
  const { lights } = useLightingStore();

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [5, 5, 5], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <color attach="background" args={['#0a0a0b']} />
        
        {/* Scene Lights */}
        {lights.map((light) => (
          <SceneLight key={light.id} light={light} />
        ))}

        <Grid
          args={[30, 30]}
          cellSize={1}
          cellThickness={1}
          cellColor="#242429"
          sectionSize={3}
          sectionThickness={1.5}
          sectionColor="#1a1a1f"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
        />

        {/* Default Sphere */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {objects.map((object) => (
          <SceneObject
            key={object.id}
            object={object}
            transformMode={selectedObjectId === object.id ? transformMode : null}
          />
        ))}

        <OrbitControls makeDefault />
      </Canvas>

      <Dropzone />
      <ObjectList />
      <LightingControls />

      {/* Transform Controls */}
      <div className="absolute top-4 left-4 flex gap-2">
        {(['translate', 'rotate', 'scale'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setTransformMode(mode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              transformMode === mode
                ? 'bg-blue-500 text-white'
                : 'bg-[#121214] text-gray-400 hover:bg-[#242429] hover:text-white'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};