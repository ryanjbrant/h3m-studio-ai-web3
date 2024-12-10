import React, { useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from './Scene';
import { Upload } from 'lucide-react';

interface Preview3DProps {
  maps: Record<string, ImageData> | null;
  onFileSelect: (file: File) => void;
  sourceImage: HTMLImageElement | null;
}

export const Preview3D: React.FC<Preview3DProps> = ({ maps, onFileSelect, sourceImage }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-blue-500');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500');
  };

  return (
    <div
      className="w-full h-full bg-[#121214] rounded-lg overflow-hidden relative transition-all duration-200"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Canvas
        shadows
        camera={{ position: [2, 2, 4], fov: 45 }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          shadowMap: {
            enabled: true,
            type: THREE.PCFSoftShadowMap
          }
        }}
      >
        {maps ? (
          <Scene maps={maps} sourceImage={sourceImage} />
        ) : (
          <mesh>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial color="#2a2a2f" />
          </mesh>
        )}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.5}
        />
        <Environment preset="studio" background={false} />
      </Canvas>

      {!maps && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <Upload className="w-12 h-12" />
            <p className="text-lg">Drop texture here</p>
          </div>
        </div>
      )}
    </div>
  );
};