import React, { Suspense } from 'react';
import { SceneCanvas } from '../components/scene-builder/SceneCanvas';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBoundary } from '../components/ErrorBoundary';

const SceneBuilder: React.FC = () => {
  return (
    <div className="h-[calc(100vh-44px)] bg-[#0a0a0b]">
      <ErrorBoundary FallbackComponent={({ error }) => (
        <div className="w-full h-full flex items-center justify-center text-red-400">
          <p>Error loading scene: {error.message}</p>
        </div>
      )}>
        <Suspense fallback={<LoadingSpinner />}>
          <SceneCanvas />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default SceneBuilder;