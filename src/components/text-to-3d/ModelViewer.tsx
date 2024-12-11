import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { DefaultModel } from './DefaultModel';
import { LoadedModel } from './LoadedModel';
import { ErrorBoundary } from '../ErrorBoundary';

interface ModelViewerProps {
  modelUrl?: string | null;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ modelUrl }) => {
  return (
    <div className="w-full h-full">
      <ErrorBoundary FallbackComponent={({ error }) => (
        <div className="w-full h-full flex items-center justify-center text-red-400">
          <p>Error loading model: {error.message}</p>
        </div>
      )}>
        <Canvas
          shadows
          camera={{ position: [0, 0, 4], fov: 50 }}
          className="w-full h-full"
        >
          <color attach="background" args={['#121214']} />
          <gridHelper args={[20, 20, '#242429', '#1a1a1f']} position={[0, -1, 0]} />
          <Stage
            environment="city"
            intensity={0.5}
            adjustCamera={1.5}
            shadows={false}
            preset="rembrandt"
          >
            <Suspense fallback={<DefaultModel />}>
              {modelUrl ? (
                <LoadedModel modelUrl={modelUrl} />
              ) : (
                <DefaultModel />
              )}
            </Suspense>
          </Stage>
          <OrbitControls 
            makeDefault
            minDistance={2}
            maxDistance={10}
            enablePan={false}
            autoRotate={!modelUrl}
            autoRotateSpeed={1}
          />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};