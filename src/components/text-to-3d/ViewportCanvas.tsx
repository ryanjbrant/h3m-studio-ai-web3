import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Model } from './Model';
import { TextureMapUrls } from '../../types/model';

interface ViewportCanvasProps {
  camera: {
    position: [number, number, number];
    rotation?: [number, number, number];
    orthographic?: boolean;
    zoom?: number;
  };
  controls?: boolean;
  label: string;
  modelUrl: string;
  displayMode: 'wireframe' | 'shaded' | 'albedo';
  lightIntensity: number;
  onTextureApplied?: (callback: (textureUrls: TextureMapUrls) => void) => void;
  modelType?: 'text-to-3d' | 'image-to-3d' | 'other';
  envMapUrl?: string | null;
}

export function ViewportCanvas({
  camera,
  controls = true,
  label,
  envMapUrl,
  modelUrl,
  displayMode,
  lightIntensity,
  onTextureApplied,
  modelType
}: ViewportCanvasProps) {
  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded z-10">
        {label}
      </div>
      <Canvas
        shadows
        camera={camera}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          alpha: true
        }}
      >
        <Suspense
          fallback={
            <Html center>
              <div className="flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-2 text-sm text-gray-400">Loading model...</p>
              </div>
            </Html>
          }
        >
          <Model
            url={modelUrl}
            displayMode={displayMode}
            onTextureApplied={onTextureApplied}
            modelType={modelType}
          />
          <ambientLight intensity={0.3 * lightIntensity} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={2 * lightIntensity}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          {envMapUrl && (
            <Environment
              files={envMapUrl}
              background={false}
              blur={0.5}
              preset={undefined}
            />
          )}
          {controls && (
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              enableRotate={true}
              minDistance={2}
              maxDistance={10}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2}
              autoRotateSpeed={1}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
} 