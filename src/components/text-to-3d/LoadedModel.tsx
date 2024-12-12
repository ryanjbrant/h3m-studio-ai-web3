import { useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from '../ErrorBoundary';

interface LoadedModelProps {
  modelUrl?: string;
}

function Model({ url }: { url: string }) {
  // Create proxy URL
  const proxyUrl = `http://localhost:3001/api/model?url=${encodeURIComponent(url)}`;
  
  // Load model
  const { scene } = useGLTF(proxyUrl);

  useEffect(() => {
    if (!scene) return;
    
    // Process the loaded scene
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(material => {
            material.needsUpdate = true;
            material.side = THREE.DoubleSide;
            
            if (material.type === 'MeshStandardMaterial') {
              material.roughness = 0.1;
              material.metalness = 0.7;
              material.envMapIntensity = 0.5;
              material.normalScale?.set(0.5, 0.5);
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

    // Cleanup
    return () => {
      useGLTF.clear(proxyUrl);
    };
  }, [scene, proxyUrl]);

  return <primitive object={scene} />;
}

export function LoadedModel({ modelUrl }: LoadedModelProps) {
  if (!modelUrl) {
    return (
      <div className="w-full h-full bg-[#121214] rounded-lg overflow-hidden relative">
        <Canvas>
          <mesh>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#2a2a2f" />
          </mesh>
          <OrbitControls autoRotate autoRotateSpeed={1} />
        </Canvas>
      </div>
    );
  }

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
        >
          <Suspense fallback={null}>
            <Model url={modelUrl} />
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
            <Environment preset="studio" background={false} />
          </Suspense>
          
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 1.5}
            autoRotate={false}
            autoRotateSpeed={1}
          />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}