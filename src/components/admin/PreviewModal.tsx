import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface TextureFile {
  name: string;
  url?: string;
}

interface PreviewModalProps {
  file: File | string;
  sceneFiles?: {
    gltf: File | string;
    bin?: File | string;
    textures: (File | TextureFile)[];
  };
  onClose: () => void;
  onSnapshotTaken: (snapshot: string) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ 
  file, 
  sceneFiles,
  onClose, 
  onSnapshotTaken 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#242429');

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.5;
    controls.maxDistance = 10;

    const loadModel = async () => {
      try {
        if (sceneFiles) {
          // Handle GLTF scene
          const loader = new GLTFLoader();
          const manager = new THREE.LoadingManager();
          const textureUrls = new Map<string, string>();
          
          // Get texture URLs
          for (const texture of sceneFiles.textures) {
            if (texture instanceof File) {
              const url = URL.createObjectURL(texture);
              textureUrls.set(texture.name, url);
            } else {
              textureUrls.set(texture.name, texture.url || '');
            }
          }

          // Get bin URL if it exists
          let binUrl: string | undefined;
          if (sceneFiles.bin) {
            binUrl = sceneFiles.bin instanceof File 
              ? URL.createObjectURL(sceneFiles.bin)
              : sceneFiles.bin;
          }

          // Read or use GLTF content
          let gltfContent: string;
          if (sceneFiles.gltf instanceof File) {
            gltfContent = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsText(sceneFiles.gltf as Blob);
            });
          } else {
            const response = await fetch(sceneFiles.gltf);
            gltfContent = await response.text();
          }

          const gltfData = JSON.parse(gltfContent);
          const textureNames = new Set<string>();

          // Extract texture file names from GLTF
          if (gltfData.images) {
            gltfData.images.forEach((image: { uri?: string }) => {
              if (image.uri) {
                const fileName = image.uri.split('/').pop();
                if (fileName) textureNames.add(fileName);
              }
            });
          }

          // Modify URLs in the manager
          manager.setURLModifier((url) => {
            const filename = url.split('/').pop();
            if (filename) {
              // Check if this is a texture file
              if (textureUrls.has(filename)) {
                console.log('Loading texture:', filename);
                return textureUrls.get(filename)!;
              }
              // Check if this is the bin file
              if (binUrl && filename.endsWith('.bin')) {
                console.log('Loading bin file:', filename);
                return binUrl;
              }
            }
            return url;
          });

          loader.manager = manager;
          const gltfUrl = sceneFiles.gltf instanceof File
            ? URL.createObjectURL(sceneFiles.gltf)
            : sceneFiles.gltf;
          
          const gltf = await new Promise<GLTF>((resolve, reject) => {
            loader.load(gltfUrl, resolve, undefined, (error) => {
              console.error('Error loading GLTF:', error);
              reject(error);
            });
          });

          // Clean up blob URLs
          if (sceneFiles.gltf instanceof File) {
            URL.revokeObjectURL(gltfUrl);
          }
          if (binUrl && sceneFiles.bin instanceof File) {
            URL.revokeObjectURL(binUrl);
          }
          textureUrls.forEach((url, name) => {
            const texture = sceneFiles.textures.find(t => 
              t instanceof File ? t.name === name : t.name === name
            );
            if (texture instanceof File) {
              URL.revokeObjectURL(url);
            }
          });

          return gltf;
        } else {
          // Handle GLB or USDZ file
          const url = file instanceof File ? URL.createObjectURL(file) : file;
          let gltf: GLTF | THREE.Group;

          if ((file instanceof File ? file.name : url).toLowerCase().endsWith('.usdz')) {
            const loader = new USDZLoader();
            const model = await new Promise<THREE.Mesh>((resolve, reject) => {
              loader.load(url, resolve, undefined, reject);
            });
            const group = new THREE.Group();
            group.add(model);
            gltf = { scene: group } as GLTF;
          } else {
            const loader = new GLTFLoader();
            gltf = await new Promise<GLTF>((resolve, reject) => {
              loader.load(url, resolve, undefined, reject);
            });
          }

          if (file instanceof File) {
            URL.revokeObjectURL(url);
          }
          return gltf;
        }
      } catch (error) {
        console.error('Model loading error:', error);
        throw error;
      }
    };

    loadModel()
      .then((gltf) => {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        gltf.scene.scale.multiplyScalar(scale);
        gltf.scene.position.sub(center.multiplyScalar(scale));

        scene.add(gltf.scene);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading model:', error);
        setError('Failed to load 3D model. Please check the file format and try again.');
        setIsLoading(false);
      });

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Handle snapshot
    const takeSnapshot = () => {
      const dataUrl = renderer.domElement.toDataURL('image/png');
      onSnapshotTaken(dataUrl);
      onClose();
    };

    // Add snapshot button
    const snapshotButton = document.createElement('button');
    snapshotButton.textContent = 'Take Snapshot';
    snapshotButton.className = 'absolute bottom-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors';
    snapshotButton.onclick = takeSnapshot;
    container.appendChild(snapshotButton);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      scene.clear();
      if (container) {
        if (renderer.domElement.parentElement === container) {
          container.removeChild(renderer.domElement);
        }
        if (snapshotButton.parentNode === container) {
          container.removeChild(snapshotButton);
        }
      }
    };
  }, [file, sceneFiles, onClose, onSnapshotTaken]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-[#0a0a0b] rounded-lg w-[800px] h-[600px]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-[#242429] rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-400">Loading model...</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-500">{error}</span>
          </div>
        )}
        <div 
          ref={containerRef} 
          className="w-full h-full"
        />
      </div>
    </div>
  );
}; 