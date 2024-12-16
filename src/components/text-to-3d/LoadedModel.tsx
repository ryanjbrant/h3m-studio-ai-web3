// Import required dependencies and components
import { useEffect, Suspense, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useThree, extend } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { ErrorBoundary } from '../ErrorBoundary';
import { SceneBuilder } from '../scene-builder/SceneBuilder';
import { generateMaps } from '../../utils/textureGenerator';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { uploadModel } from '../../services/modelService';
import { useAuth } from '../../hooks/useAuth';
import { Layout, Box, Boxes, Layers, SunMedium, Palette } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Controls } from '../Controls';
import { useTextureStore } from '../../store/textureStore';
import { TextureHandler } from './TextureHandler';
import { TextureMapUrls } from '../../types/model';
import { GeneratedMaps } from '../../types/texture';

// Ensure THREE is available globally for loaders
if (typeof window !== 'undefined') {
  // Use a more specific global variable name to avoid conflicts
  (window as any).__THREEJS_INSTANCE__ = THREE;
}

// Register loaders after THREE is globally available
extend({ EXRLoader });

// Define component prop interfaces
interface LoadedModelProps {
  modelUrl?: string;
  displayMode?: 'wireframe' | 'shaded' | 'albedo';
  lightIntensity?: number;
  currentView?: 'model' | 'scene';
  onModelUploaded?: (url: string) => void;
  onTextureApplied?: (textureUrls: TextureMapUrls) => void;
  onTextureGenerated?: (maps: GeneratedMaps) => void;
  setLightIntensity?: (intensity: number) => void;
}

interface ModelProps {
  url: string;
  displayMode: 'wireframe' | 'shaded' | 'albedo';
  modelType?: 'text-to-3d' | 'image-to-3d' | 'other';
}

// Type definitions for objects with materials
type Object3DWithMaterial = THREE.Object3D & {
  material?: THREE.Material | THREE.Material[];
  geometry?: THREE.BufferGeometry;
};

// Cache for loaded models
const modelCache = new Map<string, THREE.Group>();

// Model component for rendering 3D models
function Model({ url, displayMode, modelType = 'text-to-3d' }: ModelProps) {
  const modelRef = useRef<THREE.Group>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { scene } = useThree();

  // Load model using GLTF loader
  const { scene: gltfScene } = useGLTF(url, true);

  // Setup model when GLTF is loaded
  useEffect(() => {
    if (!gltfScene) return;

    try {
      // Create and setup model group
      const group = new (window as any).__THREEJS_INSTANCE__.Group();
      scene.add(group);
      modelRef.current = group;

      // Clone and add model to scene
      const model = gltfScene.clone(true);
      group.add(model);

      // Center the model
      const box = new (window as any).__THREEJS_INSTANCE__.Box3().setFromObject(model);
      const center = box.getCenter(new (window as any).__THREEJS_INSTANCE__.Vector3());
      model.position.sub(center);

      // Process model geometries
      model.traverse((child: Object3DWithMaterial) => {
        if (child instanceof (window as any).__THREEJS_INSTANCE__.Mesh && child.geometry) {
          child.geometry.computeBoundingSphere();
          child.geometry.computeBoundingBox();
        }
      });

      // Setup model materials
      model.traverse((child: Object3DWithMaterial) => {
        if (child instanceof (window as any).__THREEJS_INSTANCE__.Mesh) {
          const material = new (window as any).__THREEJS_INSTANCE__.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: displayMode === 'shaded' ? 0.4 : 0,
            roughness: displayMode === 'shaded' ? 0.6 : 1,
            clearcoat: displayMode === 'shaded' ? 0.4 : 0,
            clearcoatRoughness: 0.1,
            ior: 1.1,
            envMapIntensity: displayMode === 'shaded' ? 0.9 : 0,
            wireframe: displayMode === 'wireframe',
            side: (window as any).__THREEJS_INSTANCE__.DoubleSide,
          });
          child.material = material;
        }
      });

      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('[Model] Error setting up model:', err);
      setError(err instanceof Error ? err.message : 'Failed to setup model');
      setIsLoading(false);
    }

    return () => {
      if (modelRef.current) {
        scene.remove(modelRef.current);
        modelRef.current.traverse((child: Object3DWithMaterial) => {
          if (child instanceof (window as any).__THREEJS_INSTANCE__.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [gltfScene, scene, displayMode]);

  // Show loading state
  if (isLoading) {
    return (
      <Html center>
        <div className="flex flex-col items-center justify-center bg-black/50 p-4 rounded-lg">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-white">Loading model...</p>
        </div>
      </Html>
    );
  }

  // Show error state
  if (error) {
    return (
      <Html center>
        <div className="text-red-500 bg-black/50 p-2 rounded">
          {error}
        </div>
      </Html>
    );
  }

  return null; // Model is managed via the ref
}

// Global state for environment map
let globalEnvMapUrl: string | null = null;
let globalEnvMapTexture: THREE.DataTexture | null = null;
let isLoadingEnvMap = false;

// Function to load environment map
const loadEnvironmentMap = async (): Promise<string> => {
  if (globalEnvMapUrl) {
    return globalEnvMapUrl;
  }
  
  if (isLoadingEnvMap) {
    throw new Error('Environment map is already loading');
  }
  
  isLoadingEnvMap = true;
  
  try {
    // Load environment map from storage
    const storage = getStorage();
    const envMapRef = ref(storage, 'hdri-maps/industrial/Modern_Industrial_005_sm.exr');
    const url = await getDownloadURL(envMapRef);
    
    // Load and process environment texture
    const exrLoader = new EXRLoader();
    const texture = await new Promise<THREE.DataTexture>((resolve, reject) => {
      exrLoader.load(
        url,
        (texture) => {
          if (texture instanceof THREE.DataTexture) {
            texture.colorSpace = THREE.LinearSRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.flipY = true;
            resolve(texture);
          } else {
            reject(new Error('Invalid texture type'));
          }
        },
        undefined,
        (error) => reject(error)
      );
    });
    
    // Cache loaded texture
    globalEnvMapTexture = texture;
    globalEnvMapUrl = url;
    
    console.log('[EnvMap] Successfully loaded environment map');
    return url;
    
  } catch (error) {
    console.error('[EnvMap] Error loading environment map:', error);
    throw error;
  } finally {
    isLoadingEnvMap = false;
  }
};

const envMapLoadPromise = loadEnvironmentMap();

// Scene manager component for material updates
function SceneManager({ displayMode, modelType = 'text-to-3d' }: { displayMode: 'wireframe' | 'shaded' | 'albedo'; modelType?: 'text-to-3d' | 'image-to-3d' | 'other' }) {
  const { scene } = useThree();

  // Update materials when display mode changes
  useEffect(() => {
    if (scene) {
      scene.traverse((child: Object3DWithMaterial) => {
        if (child instanceof THREE.Mesh) {
          // Handle image-to-3D models
          if (modelType === 'image-to-3d') {
            const material = child.material;
            if (material instanceof THREE.MeshStandardMaterial) {
              material.wireframe = displayMode === 'wireframe';
              if (displayMode === 'albedo') {
                material.envMapIntensity = 0;
                material.normalScale.set(0, 0);
                material.displacementScale = 0;
                material.aoMapIntensity = 0;
                material.roughness = 1;
                material.metalness = 0;
              } else if (displayMode === 'shaded') {
                material.envMapIntensity = 1.0;
                material.normalScale.set(1, 1);
                material.displacementScale = 0.1;
                material.aoMapIntensity = 1;
              }
              material.needsUpdate = true;
            }
          } else {
            // Create premium material for text-to-3D models
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
            
            // Update mesh material
            child.material = material;
            material.needsUpdate = true;
          }
        }
      });
    }
  }, [scene, displayMode, modelType]);

  return null;
}

// Props interface for ViewportCanvas component
interface ViewportCanvasProps {
  camera: {
    position: [number, number, number];
    rotation?: [number, number, number];
    orthographic?: boolean;
    zoom?: number;
  };
  controls?: boolean;
  label: string;
  envMapUrl: string | null;
  modelUrl: string;
  displayMode: 'wireframe' | 'shaded' | 'albedo';
  lightIntensity: number;
  onTextureApplied?: (textureUrls: TextureMapUrls) => void;
  modelType?: 'text-to-3d' | 'image-to-3d' | 'other';
}

// ViewportCanvas component for rendering 3D viewport
const ViewportCanvas = ({ 
  camera, 
  controls = true,
  label,
  modelUrl,
  displayMode,
  lightIntensity,
  modelType
}: ViewportCanvasProps) => {
  const [hasContextLost, setHasContextLost] = useState(false);
  const [isEnvMapReady, setIsEnvMapReady] = useState(!!globalEnvMapTexture);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize environment map
  useEffect(() => {
    if (globalEnvMapTexture) {
      setIsEnvMapReady(true);
    }
  }, [globalEnvMapTexture]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded z-10">{label}</div>
      <Canvas
        ref={canvasRef}
        shadows
        camera={camera}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false,
          logarithmicDepthBuffer: true,
          precision: 'highp',
          stencil: false
        }}
        onCreated={({ gl }) => {
          console.log('[ViewportCanvas] WebGL context created');
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ErrorBoundary
          FallbackComponent={({ error }) => (
            <Html center>
              <div className="text-red-500">Error: {error.message}</div>
            </Html>
          )}
        >
          <Suspense fallback={
            <Html center>
              <div className="flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-gray-400">Loading...</p>
              </div>
            </Html>
          }>
            {/* Scene setup */}
            <ambientLight intensity={0.3 * lightIntensity} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={2 * lightIntensity}
              castShadow
              shadow-mapSize={[1024, 1024]}
              shadow-bias={-0.0001}
            />
            {isEnvMapReady && globalEnvMapTexture && (
              <Environment
                map={globalEnvMapTexture}
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
                enableDamping={false}
                rotateSpeed={0.5}
                zoomSpeed={0.5}
              />
            )}
            
            {/* Load model only when URL is available */}
            {modelUrl && (
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
                  modelType={modelType}
                />
                <SceneManager displayMode={displayMode} modelType={modelType} />
              </Suspense>
            )}
          </Suspense>
        </ErrorBoundary>
      </Canvas>
    </div>
  );
};

function ModelViewer({ 
  modelUrl, 
  displayMode, 
  lightIntensity,
  onTextureApplied,
  isMultiView,
  modelType = 'text-to-3d'
}: { 
  modelUrl: string; 
  displayMode: 'wireframe' | 'shaded' | 'albedo';
  lightIntensity: number;
  onTextureApplied?: (textureUrls: TextureMapUrls) => void;
  isMultiView: boolean;
  modelType?: 'text-to-3d' | 'image-to-3d' | 'other';
}) {
  // State for environment map loading
  const [envMapUrl, setEnvMapUrl] = useState<string | null>(globalEnvMapUrl);
  const [isEnvMapLoading, setIsEnvMapLoading] = useState(!globalEnvMapUrl);

  // Load environment map
  useEffect(() => {
    if (!envMapUrl && !isEnvMapLoading) {
      setIsEnvMapLoading(true);
      envMapLoadPromise.then(url => {
        setEnvMapUrl(url);
        setIsEnvMapLoading(false);
      }).catch(error => {
        console.error('Error loading environment map:', error);
        setIsEnvMapLoading(false);
      });
    }
  }, [envMapUrl, isEnvMapLoading]);

  // Preload model
  useEffect(() => {
    if (modelUrl) {
      useGLTF.preload(modelUrl);
    }
    return () => {
      if (modelUrl) {
        useGLTF.clear(modelUrl);
      }
    };
  }, [modelUrl]);

  // Configure viewport views
  const views = useMemo(() => {
    if (!isMultiView) {
      return [{
        label: "Perspective",
        camera: { position: [5, 5, 5] as [number, number, number] }
      }];
    }

    return [
      {
        label: "Perspective",
        camera: { position: [5, 5, 5] as [number, number, number] }
      },
      {
        label: "Top",
        camera: { 
          position: [0, 10, 0] as [number, number, number],
          rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
          orthographic: true,
          zoom: 50
        }
      },
      {
        label: "Front",
        camera: { 
          position: [0, 0, 10] as [number, number, number],
          orthographic: true,
          zoom: 50
        }
      },
      {
        label: "Right",
        camera: { 
          position: [10, 0, 0] as [number, number, number],
          rotation: [0, -Math.PI / 2, 0] as [number, number, number],
          orthographic: true,
          zoom: 50
        }
      }
    ];
  }, [isMultiView]);

  return (
    <div className={cn(
      "w-full h-full",
      isMultiView ? "grid grid-cols-2 grid-rows-2 gap-1" : ""
    )}>
      {views.map((view, index) => (
        <ViewportCanvas
          key={`${view.label}-${index}`}
          label={view.label}
          camera={view.camera}
          envMapUrl={envMapUrl}
          modelUrl={modelUrl}
          displayMode={displayMode}
          lightIntensity={lightIntensity}
          onTextureApplied={onTextureApplied}
          modelType={modelType}
        />
      ))}
    </div>
  );
}

export function LoadedModel({
  modelUrl,
  displayMode = 'shaded',
  lightIntensity = 1,
  currentView = 'model',
  onModelUploaded,
  onTextureApplied,
  onTextureGenerated,
  modelType = 'text-to-3d',
  setLightIntensity
}: LoadedModelProps & {
  modelType?: 'text-to-3d' | 'image-to-3d' | 'other';
}) {
  // State for model loading and view management
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'model' | 'scene'>(currentView);
  const [materialMode, setMaterialMode] = useState<'wireframe' | 'shaded' | 'albedo'>(displayMode);
  const [isMultiView, setIsMultiView] = useState(false);
  const [generatedMaps, setGeneratedMaps] = useState<{
    normal: ImageData | null;
    displacement: ImageData | null;
    ao: ImageData | null;
    specular: ImageData | null;
  }>({
    normal: null,
    displacement: null,
    ao: null,
    specular: null
  });
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useTextureStore();

  // Helper functions for file validation
  const isImageFile = (file: File) => /\.(png|jpe?g|webp)$/i.test(file.name);
  const isModelFile = (file: File) => /\.(glb|gltf|fbx|usdz)$/i.test(file.name);

  // Handle texture file drops
  const handleTextureDropped = async (file: File) => {
    try {
      // Load and process image
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      // Generate texture maps
      const maps = await generateMaps(img, settings);
      
      // Update state and notify parent
      setGeneratedMaps({
        normal: maps.normal,
        displacement: maps.displacement,
        ao: maps.ao,
        specular: maps.specular
      });

      onTextureGenerated?.(maps);

      URL.revokeObjectURL(img.src);

    } catch (error) {
      console.error('Error generating texture maps:', error);
      setUploadError('Failed to generate texture maps');
    }
  };

  // Handle model file drops
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

  // Setup drag and drop handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleDrop = async (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      const file = event.dataTransfer?.files[0];
      if (!file) return;

      if (isImageFile(file)) {
        handleTextureDropped(file);
      } else if (isModelFile(file)) {
        handleModelDropped(file);
      } else {
        setUploadError('Unsupported file type. Please upload a model or image file.');
      }
    };

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragover', handleDragOver);

    return () => {
      container.removeEventListener('drop', handleDrop);
      container.removeEventListener('dragover', handleDragOver);
    };
  }, [settings]);

  const handleTextureGenerated = (maps: GeneratedMaps) => {
    setGeneratedMaps(maps);
    onTextureGenerated?.(maps);
  };

  return (
    <div className="flex flex-1 h-full relative">
      <div className="flex-1 relative">
        {/* Unified Toolbar */}
        <div className="absolute top-0 left-0 right-0 z-10 p-2 bg-black/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            {/* View Controls Group */}
            <div className="flex items-center gap-2 px-2 py-1 bg-black/20 rounded-lg">
              <span className="text-xs text-gray-400 font-medium">View</span>
              <div className="w-px h-4 bg-gray-700" />
              <button
                onClick={() => setViewMode('model')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors',
                  viewMode === 'model' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                )}
              >
                <Boxes className="w-4 h-4" />
                Model
              </button>
              <button
                onClick={() => setViewMode('scene')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors',
                  viewMode === 'scene' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                )}
              >
                <Box className="w-4 h-4" />
                Scene
              </button>
            </div>

            {/* Material Controls Group */}
            <div className="flex items-center gap-2 px-2 py-1 bg-black/20 rounded-lg">
              <span className="text-xs text-gray-400 font-medium">Material</span>
              <div className="w-px h-4 bg-gray-700" />
              <button
                onClick={() => setMaterialMode('shaded')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors',
                  materialMode === 'shaded' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                )}
              >
                <SunMedium className="w-4 h-4" />
                Shaded
              </button>
              <button
                onClick={() => setMaterialMode('wireframe')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors',
                  materialMode === 'wireframe' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                )}
              >
                <Layers className="w-4 h-4" />
                Wireframe
              </button>
              <button
                onClick={() => setMaterialMode('albedo')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors',
                  materialMode === 'albedo' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                )}
              >
                <Palette className="w-4 h-4" />
                Albedo
              </button>
            </div>

            {/* Light Controls Group */}
            <div className="flex items-center gap-2 px-2 py-1 bg-black/20 rounded-lg">
              <span className="text-xs text-gray-400 font-medium">Light</span>
              <div className="w-px h-4 bg-gray-700" />
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lightIntensity}
                onChange={(e) => setLightIntensity?.(parseFloat(e.target.value))}
                className="w-24 accent-blue-500"
              />
              <span className="text-xs text-gray-400 min-w-[2ch]">{lightIntensity.toFixed(1)}</span>
            </div>

            {/* Layout Controls Group */}
            <div className="flex items-center gap-2 px-2 py-1 bg-black/20 rounded-lg">
              <span className="text-xs text-gray-400 font-medium">Layout</span>
              <div className="w-px h-4 bg-gray-700" />
              <button
                onClick={() => setIsMultiView(prev => !prev)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors',
                  isMultiView ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                )}
              >
                <Layout className="w-4 h-4" />
                {isMultiView ? 'Single View' : '4-Up View'}
              </button>
            </div>
          </div>
        </div>

        <ErrorBoundary
          FallbackComponent={({ error }) => (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
              <p className="text-red-400 text-sm">Error loading model: {error.message}</p>
            </div>
          )}
        >
          {viewMode === 'model' ? (
            <>
              {modelUrl ? (
                <div className="relative w-full h-full">
                  <TextureHandler
                    onTextureGenerated={handleTextureGenerated}
                    onTextureApplied={onTextureApplied}
                  />
                  <ModelViewer 
                    modelUrl={modelUrl} 
                    displayMode={materialMode} 
                    lightIntensity={lightIntensity}
                    onTextureApplied={onTextureApplied}
                    isMultiView={isMultiView}
                    modelType={modelType}
                  />
                </div>
              ) : (
                <Canvas>
                  <mesh>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial color="#2a2a2f" />
                  </mesh>
                  <OrbitControls autoRotate autoRotateSpeed={1} />
                </Canvas>
              )}
            </>
          ) : (
            <div className="w-full h-full">
              <SceneBuilder initialModelUrl={modelUrl} isMultiView={isMultiView} />
            </div>
          )}
        </ErrorBoundary>

        {/* Loading overlays */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-700">Uploading model... {uploadProgress.toFixed(1)}%</p>
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
      </div>

      {/* Texture Controls Sidebar */}
      {viewMode === 'model' && (generatedMaps.normal || generatedMaps.displacement || generatedMaps.ao || generatedMaps.specular) && (
        <div className="w-80 border-l border-[#242429] overflow-hidden">
          <Controls 
            maps={generatedMaps}
            onGenerate={async () => {
              try {
                // Your generation logic here
                return "taskId";
              } catch (error) {
                console.error('Generation error:', error);
                throw error;
              }
            }}
          />
        </div>
      )}
    </div>
  );
}