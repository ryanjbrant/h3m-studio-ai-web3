import { useEffect, Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from '../ErrorBoundary';
import { SceneBuilder } from '../scene-builder/SceneBuilder';
import { generateMaps } from '../../utils/textureGenerator';
import { TextureSettings } from '../../types';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { uploadModel, saveTextureMaps, TextureMapUrls } from '../../services/modelService';
import { useAuth } from '../../hooks/useAuth';

interface LoadedModelProps {
  modelUrl?: string;
  displayMode?: 'wireframe' | 'shaded' | 'albedo';
  lightIntensity?: number;
  currentView?: 'model' | 'scene';
  onTextureGenerated?: (maps: any) => void;
  onModelUploaded?: (url: string) => void;
  onTextureApplied?: (textureUrls: TextureMapUrls) => void;
}

interface ModelProps {
  url: string;
  displayMode: 'wireframe' | 'shaded' | 'albedo';
  onTextureApplied?: (textureUrls: TextureMapUrls) => void;
}

function Model({ url, displayMode, onTextureApplied }: ModelProps) {
  const gltf = useGLTF(url);
  const modelRef = useRef<THREE.Group>();
  const [isApplyingTextures, setIsApplyingTextures] = useState(false);

  const applyTextures = useCallback(async (textureUrls: TextureMapUrls) => {
    if (!modelRef.current) return;
    setIsApplyingTextures(true);
    
    try {
      const textureLoader = new THREE.TextureLoader();
      
      // Load all textures concurrently
      const [albedoMap, normalMap, displacementMap, aoMap, specularMap] = await Promise.all([
        textureUrls.albedo ? textureLoader.loadAsync(textureUrls.albedo) : null,
        textureUrls.normal ? textureLoader.loadAsync(textureUrls.normal) : null,
        textureUrls.displacement ? textureLoader.loadAsync(textureUrls.displacement) : null,
        textureUrls.ao ? textureLoader.loadAsync(textureUrls.ao) : null,
        textureUrls.specular ? textureLoader.loadAsync(textureUrls.specular) : null
      ]);

      // Apply textures to all meshes in the model
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Store the old material for disposal
          const oldMaterial = child.material;

          // Create new material with textures
          const material = new THREE.MeshStandardMaterial({
            map: albedoMap || undefined,
            normalMap: normalMap || undefined,
            normalScale: new THREE.Vector2(1, 1),
            displacementMap: displacementMap || undefined,
            displacementScale: 0.1,
            displacementBias: 0,
            aoMap: aoMap || undefined,
            aoMapIntensity: 1,
            roughnessMap: specularMap || undefined,
            roughness: 0.5,
            metalness: 0.5,
            envMapIntensity: 1.5
          });

          // Ensure UV2 exists for AO map
          if (child.geometry && !child.geometry.hasAttribute('uv2')) {
            child.geometry.setAttribute('uv2', child.geometry.getAttribute('uv'));
          }

          // Apply new material
          child.material = material;

          // Dispose of old material and its textures
          if (oldMaterial) {
            if (Array.isArray(oldMaterial)) {
              oldMaterial.forEach(mat => {
                if (mat.map) mat.map.dispose();
                if (mat.normalMap) mat.normalMap.dispose();
                if (mat.displacementMap) mat.displacementMap.dispose();
                if (mat.aoMap) mat.aoMap.dispose();
                if (mat.roughnessMap) mat.roughnessMap.dispose();
                mat.dispose();
              });
            } else {
              if (oldMaterial.map) oldMaterial.map.dispose();
              if (oldMaterial.normalMap) oldMaterial.normalMap.dispose();
              if (oldMaterial.displacementMap) oldMaterial.displacementMap.dispose();
              if (oldMaterial.aoMap) oldMaterial.aoMap.dispose();
              if (oldMaterial.roughnessMap) oldMaterial.roughnessMap.dispose();
              oldMaterial.dispose();
            }
          }

          // Update material based on display mode
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
      });
    } catch (error) {
      console.error('Error applying textures:', error);
    } finally {
      setIsApplyingTextures(false);
    }
  }, [displayMode]);

  // Register texture handler
  useEffect(() => {
    console.log('Setting up texture handler');
    if (onTextureApplied) {
      applyTextures(onTextureApplied);
    }
  }, [onTextureApplied, applyTextures]);

  return (
    <>
      <primitive ref={modelRef} object={gltf.scene} />
      {isApplyingTextures && (
        <Html center>
          <div className="flex flex-col items-center justify-center bg-black/50 p-4 rounded-lg">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-white">Applying textures...</p>
          </div>
        </Html>
      )}
    </>
  );
}

// Global HDRI state
let globalEnvMapUrl: string | null = null;
let isLoadingEnvMap = false;
const envMapLoadPromise = new Promise<string>((resolve) => {
  const loadEnvMap = async () => {
    if (globalEnvMapUrl) return globalEnvMapUrl;
    if (isLoadingEnvMap) return;
    
    isLoadingEnvMap = true;
    try {
      const storage = getStorage();
      const envMapRef = ref(storage, 'hdri-maps/industrial/Modern_Industrial_005_sm.exr');
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

// Premium material settings
const createPremiumMaterial = () => {
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    ior: 1.45,
    envMapIntensity: 1.5,
    side: THREE.DoubleSide,
  });
  return material;
};

// Scene manager to handle material updates
function SceneManager({ displayMode }: { displayMode: 'wireframe' | 'shaded' | 'albedo' }) {
  const { scene } = useThree();

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Create new premium material
          const material = createPremiumMaterial();
          
          // Apply display mode settings
          switch (displayMode) {
            case 'wireframe':
              material.wireframe = true;
              break;
            case 'shaded':
              material.wireframe = false;
              break;
            case 'albedo':
              material.wireframe = false;
              material.metalness = 0;
              material.roughness = 1;
              material.clearcoat = 0;
              material.envMapIntensity = 0;
              break;
          }
          
          // Assign the new material
          child.material = material;
          material.needsUpdate = true;
        }
      });
    }
  }, [scene, displayMode]);

  return null;
}

function ModelViewer({ 
  modelUrl, 
  displayMode, 
  lightIntensity,
  onTextureApplied
}: { 
  modelUrl: string; 
  displayMode: 'wireframe' | 'shaded' | 'albedo';
  lightIntensity: number;
  onTextureApplied?: (textureUrls: TextureMapUrls) => void;
}) {
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
        <Model url={modelUrl} displayMode={displayMode} onTextureApplied={onTextureApplied} />
        <SceneManager displayMode={displayMode} />
        <ambientLight intensity={0.3 * lightIntensity} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={2 * lightIntensity}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <directionalLight
          position={[-5, 5, -5]}
          intensity={0.5 * lightIntensity}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <spotLight
          position={[0, 10, 0]}
          intensity={0.5 * lightIntensity}
          angle={0.5}
          penumbra={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        {envMapUrl && (
          <Environment
            files={envMapUrl}
            background={false}
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

export function LoadedModel({
  modelUrl,
  displayMode = 'shaded',
  lightIntensity = 1,
  currentView = 'model',
  onTextureGenerated,
  onModelUploaded,
  onTextureApplied
}: LoadedModelProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingMaps, setIsGeneratingMaps] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'texture' | 'model' | null>(null);
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleModelDropped = async (file: File) => {
    if (!user) {
      setUploadError('Please sign in to upload models');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      const metadata = await uploadModel(file, user.uid, (progress) => {
        setUploadProgress(progress);
      });

      onModelUploaded?.(metadata.modelUrl);
    } catch (error) {
      console.error('Error uploading model:', error);
      setUploadError(error instanceof Error ? error.message : 'Error uploading model');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextureDropped = async (file: File) => {
    if (!onTextureGenerated || !user || !modelUrl) return;

    try {
      setIsGeneratingMaps(true);
      setUploadError(null);

      // Load image and generate maps immediately
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const defaultSettings: TextureSettings = {
        normal: {
          strength: 100,
          blur: 0,
          sharp: 0,
          detailLevel: 5,
          filterType: 'sobel',
          invertRed: false,
          invertGreen: false,
          height: 50
        },
        displacement: {
          contrast: 0,
          blur: 0,
          sharp: 0,
          invert: false
        },
        ao: {
          strength: 100,
          mean: 50,
          range: 50,
          blur: 0,
          sharp: 0,
          invert: false
        },
        specular: {
          strength: 100,
          mean: 50,
          range: 50,
          falloff: 50
        },
        preset: null
      };

      // Generate maps immediately and show in UI
      const maps = await generateMaps(img, defaultSettings);
      onTextureGenerated(maps);

      // Create temporary object URLs for immediate display
      const tempUrls: TextureMapUrls = {
        albedo: URL.createObjectURL(file),
        normal: URL.createObjectURL(new Blob([maps.normal.data.buffer], { type: 'image/png' })),
        displacement: URL.createObjectURL(new Blob([maps.displacement.data.buffer], { type: 'image/png' })),
        ao: URL.createObjectURL(new Blob([maps.ao.data.buffer], { type: 'image/png' })),
        specular: URL.createObjectURL(new Blob([maps.specular.data.buffer], { type: 'image/png' }))
      };

      // Apply textures immediately with temp URLs
      if (onTextureApplied) {
        onTextureApplied(tempUrls);
      }

      // Upload textures with retry logic and progress tracking
      const uploadWithRetry = async (
        data: Blob | ArrayBuffer,
        type: keyof TextureMapUrls,
        retries = 3
      ): Promise<string> => {
        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            const storage = getStorage();
            const modelId = modelUrl.split('/').pop()?.split('.')[0] || 'model';
            const path = `textures/${user.uid}/models/${modelId}/${type}.png`;
            const textureRef = ref(storage, path);
            
            // Create upload task with smaller chunk size for better reliability
            const uploadTask = uploadBytesResumable(textureRef, data, {
              customMetadata: { type },
              contentType: 'image/png'
            });

            // Wait for upload to complete
            const snapshot = await uploadTask;
            const url = await getDownloadURL(snapshot.ref);
            return url;
          } catch (error) {
            console.warn(`Upload attempt ${attempt + 1} failed for ${type}:`, error);
            if (attempt === retries - 1) throw error;
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
        throw new Error(`Failed to upload ${type} after ${retries} attempts`);
      };

      // Upload all textures in parallel with progress tracking
      const uploadPromises = Object.entries(maps).map(async ([type, map]) => {
        const data = type === 'albedo' ? file : new Blob([map.data.buffer], { type: 'image/png' });
        const url = await uploadWithRetry(data, type as keyof TextureMapUrls);
        return [type, url];
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      const finalUrls = results.reduce((acc, [type, url]) => ({
        ...acc,
        [type]: url
      }), {} as TextureMapUrls);

      // Clean up temp URLs
      Object.values(tempUrls).forEach(URL.revokeObjectURL);

      // Update with final URLs from storage
      if (onTextureApplied) {
        onTextureApplied(finalUrls);
      }

    } catch (error) {
      console.error('Error handling texture:', error);
      setUploadError('Failed to process texture');
    } finally {
      setIsGeneratingMaps(false);
    }
  };

  // Add drag and drop handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleDrop = async (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      setDragType(null);
      
      const file = event.dataTransfer?.files[0];
      if (!file) return;

      const isModel = /\.(glb|gltf|fbx|usdz)$/i.test(file.name);
      const isTexture = file.type.startsWith('image/');

      if (isModel) {
        handleModelDropped(file);
      } else if (isTexture) {
        handleTextureDropped(file);
      }
    };

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);

      const items = event.dataTransfer?.items;
      if (!items?.length) return;

      const file = items[0].getAsFile();
      if (!file) return;

      const isModel = /\.(glb|gltf|fbx|usdz)$/i.test(file.name);
      const isTexture = file.type.startsWith('image/');

      if (isModel) {
        setDragType('model');
      } else if (isTexture) {
        setDragType('texture');
      }
    };

    const handleDragLeave = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const rect = container.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;

      if (
        x <= rect.left ||
        x >= rect.right ||
        y <= rect.top ||
        y >= rect.bottom
      ) {
        setIsDragging(false);
        setDragType(null);
      }
    };

    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragleave', handleDragLeave);

    return () => {
      container.removeEventListener('drop', handleDrop);
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('dragleave', handleDragLeave);
    };
  }, [user, modelUrl, onTextureGenerated, onTextureApplied]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-[#121214] rounded-lg overflow-hidden relative"
    >
      <ErrorBoundary
        FallbackComponent={({ error }) => (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
            <p className="text-red-400 text-sm">Error loading model: {error.message}</p>
          </div>
        )}
      >
        {currentView === 'model' ? (
          <>
            {modelUrl ? (
              <ModelViewer 
                modelUrl={modelUrl} 
                displayMode={displayMode} 
                lightIntensity={lightIntensity}
                onTextureApplied={onTextureApplied}
              />
            ) : (
              <Canvas>
                <mesh>
                  <sphereGeometry args={[1, 32, 32]} />
                  <meshStandardMaterial color="#2a2a2f" />
                </mesh>
                <OrbitControls autoRotate autoRotateSpeed={1} />
              </Canvas>
            )}

            {/* Loading overlays - DO NOT CHANGE */}
            {(isUploading || isGeneratingMaps) && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 flex flex-col items-center">
                  {isUploading ? (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-700">Uploading model... {uploadProgress.toFixed(1)}%</p>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-sm text-gray-700">Generating texture maps...</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-blue-500/10 pointer-events-none flex items-center justify-center">
                <div className="text-white text-lg font-medium bg-black/50 px-4 py-2 rounded-lg">
                  {dragType === 'model' ? 'Drop model here' : 'Drop texture here'}
                </div>
              </div>
            )}

            {/* Error message */}
            {uploadError && (
              <div className="absolute top-4 right-4">
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                  {uploadError}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full">
            <SceneBuilder initialModelUrl={modelUrl} />
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}