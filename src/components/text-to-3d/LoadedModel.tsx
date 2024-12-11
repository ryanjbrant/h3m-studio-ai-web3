import React, { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from '../ErrorBoundary';

interface LoadedModelProps {
  modelUrl?: string;
}

function Model({ url }: { url: string }) {
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    if (!url) return;

    const loadModel = async () => {
      try {
        // First try to load through proxy
        const proxyUrl = `http://localhost:3001/api/model?url=${encodeURIComponent(url)}`;
        console.log('Loading model from proxy:', proxyUrl);
        
        // Only preload GLB files since they're self-contained
        if (url.toLowerCase().endsWith('.glb')) {
          await useGLTF.preload(proxyUrl);
        }
      } catch (err) {
        console.error('Error preloading model:', err);
        if (retryCount < maxRetries) {
          console.log(`Retrying model load (${retryCount + 1}/${maxRetries})...`);
          setRetryCount(prev => prev + 1);
          return;
        }
        setError(err instanceof Error ? err : new Error('Failed to load model'));
      }
    };

    loadModel();

    return () => {
      if (url.toLowerCase().endsWith('.glb')) {
        useGLTF.clear(url);
      }
    };
  }, [url, retryCount]);

  if (error) {
    throw error; // This will be caught by the error boundary
  }

  // Try loading through proxy first
  const proxyUrl = `http://localhost:3001/api/model?url=${encodeURIComponent(url)}`;
  const { scene } = useGLTF(proxyUrl, undefined, undefined, (error) => {
    console.error('GLTF loader error:', error);
    if (retryCount < maxRetries) {
      console.log(`Retrying model load (${retryCount + 1}/${maxRetries})...`);
      setRetryCount(prev => prev + 1);
    } else {
      setError(new Error('Failed to load model'));
    }
  });
  
  useEffect(() => {
    if (!scene) return;
    
    console.log('Model loaded successfully:', { url: proxyUrl, scene });
    
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          // Handle both single and array materials
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(material => {
            material.needsUpdate = true;
            material.side = THREE.DoubleSide;
            
            // Enhanced PBR material properties
            if (material.type === 'MeshStandardMaterial') {
              material.roughness = 0.1; // Lower roughness for more shine
              material.metalness = 0.7; // Higher metalness for a premium look
              material.envMapIntensity = 0.5; // Enhance environment reflections
              material.normalScale?.set(0.5, 0.5); // Enhance normal map if present
            }
          });
        }
      }
    });

    // Center and scale the model
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    
    scene.position.sub(center);
    scene.scale.multiplyScalar(scale);
  }, [proxyUrl, scene]);

  return <primitive object={scene} />;
}

export function LoadedModel({ modelUrl }: LoadedModelProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full h-full bg-[#121214] rounded-lg overflow-hidden relative">
      <ErrorBoundary
        FallbackComponent={({ error }) => (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
            <p className="text-red-400 text-sm">Error loading model: {error.message}</p>
          </div>
        )}
      >
        <Canvas
          shadows
          camera={{ position: [2, 2, 4], fov: 45 }}
          gl={{ 
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
            alpha: true
          }}
          onError={(event: React.SyntheticEvent<HTMLDivElement, Event>) => {
            console.error('Canvas error:', event);
            setError('Error loading 3D model');
          }}
        >
          {modelUrl ? (
            <Suspense fallback={null}>
              <Model url={modelUrl} />
              {/* Enhanced lighting setup */}
              <ambientLight intensity={0.3} />
              <directionalLight
                position={[5, 5, 5]}
                intensity={2}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0001}
              />
              <directionalLight
                position={[-5, 5, -5]}
                intensity={0.5}
                castShadow
                shadow-mapSize={[1024, 1024]}
              />
              <spotLight
                position={[0, 10, 0]}
                intensity={0.5}
                angle={0.5}
                penumbra={1}
                castShadow
                shadow-mapSize={[1024, 1024]}
              />
              <Environment
                preset="studio"
                background={false}
              />
            </Suspense>
          ) : (
            <mesh>
              <sphereGeometry args={[1, 32, 32]} />
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
            autoRotate={!modelUrl}
            autoRotateSpeed={1}
          />
        </Canvas>
      </ErrorBoundary>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}