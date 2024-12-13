import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF } from '@react-three/drei';
import { TextureMapUrls } from '../../services/modelService';
import * as THREE from 'three';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

let globalEnvMapUrl: string | null = null;
let isLoadingEnvMap = false;
const envMapLoadPromise = new Promise<string>((resolve) => {
  const loadEnvMap = async () => {
    if (globalEnvMapUrl) return globalEnvMapUrl;
    if (isLoadingEnvMap) return;
    
    isLoadingEnvMap = true;
    try {
      const storage = getStorage();
      const envMapRef = ref(storage, 'hdri-maps/GSG_PRO_STUDIOS_METAL_001_sm.exr');
      const url = await getDownloadURL(envMapRef);
      globalEnvMapUrl = url;
      resolve(url);
    } catch (error) {
      console.error('Error loading environment map:', error);
    } finally {
      isLoadingEnvMap = false;
    }
  };
  loadEnvMap();
});

interface ModelViewerProps {
  modelUrl: string;
  displayMode: 'wireframe' | 'shaded' | 'albedo';
  lightIntensity: number;
  onTextureApplied?: (callback: (textureUrls: TextureMapUrls) => void) => void;
}

interface ModelProps {
  url: string;
  displayMode: 'wireframe' | 'shaded' | 'albedo';
  onTextureApplied?: (callback: (textureUrls: TextureMapUrls) => void) => void;
}

function Model({ url, displayMode, onTextureApplied }: ModelProps) {
  const gltf = useGLTF(url);
  const modelRef = useRef<THREE.Group>();

  // Handle material updates based on display mode
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            switch (displayMode) {
              case 'wireframe':
                material.wireframe = true;
                break;
              case 'shaded':
                material.wireframe = false;
                material.roughness = 0.3;
                material.metalness = 0.7;
                material.envMapIntensity = 1.5;
                break;
              case 'albedo':
                material.wireframe = false;
                material.roughness = 1;
                material.metalness = 0;
                material.envMapIntensity = 0;
                break;
            }
            material.needsUpdate = true;
          }
        }
      });
    }
  }, [displayMode]);

  // Register texture application callback
  useEffect(() => {
    if (onTextureApplied) {
      onTextureApplied((textureUrls) => {
        if (modelRef.current) {
          modelRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const textureLoader = new THREE.TextureLoader();
              const material = new THREE.MeshStandardMaterial();

              Promise.all([
                textureLoader.loadAsync(textureUrls.albedo),
                textureLoader.loadAsync(textureUrls.normal),
                textureLoader.loadAsync(textureUrls.displacement),
                textureLoader.loadAsync(textureUrls.ao),
                textureLoader.loadAsync(textureUrls.specular)
              ]).then(([albedoMap, normalMap, displacementMap, aoMap, specularMap]) => {
                material.map = albedoMap;
                material.normalMap = normalMap;
                material.displacementMap = displacementMap;
                material.aoMap = aoMap;
                material.roughnessMap = specularMap;
                material.needsUpdate = true;

                // Ensure UV2 exists for AO map
                if (child.geometry && !child.geometry.hasAttribute('uv2')) {
                  child.geometry.setAttribute('uv2', child.geometry.getAttribute('uv'));
                }

                child.material = material;
              });
            }
          });
        }
      });
    }
  }, [onTextureApplied]);

  return <primitive ref={modelRef} object={gltf.scene} />;
}

export function ModelViewer({ 
  modelUrl, 
  displayMode, 
  lightIntensity,
  onTextureApplied
}: ModelViewerProps) {
  const [envMapUrl, setEnvMapUrl] = useState<string | null>(globalEnvMapUrl);

  useEffect(() => {
    if (!envMapUrl) {
      envMapLoadPromise.then(url => setEnvMapUrl(url));
    }
  }, [envMapUrl]);

  return (
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
      <Suspense fallback={
        <Html center>
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-400">Loading model...</p>
          </div>
        </Html>
      }>
        <Model 
          url={modelUrl} 
          displayMode={displayMode} 
          onTextureApplied={onTextureApplied}
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
            blur={0.5}
            preset={undefined}
          />
        )}
      </Suspense>
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
    </Canvas>
  );
}