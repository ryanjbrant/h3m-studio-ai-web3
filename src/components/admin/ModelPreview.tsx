import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ModelPreviewProps {
  modelUrl: string;
  previewUrl?: string;
  className?: string;
  generatePreview?: boolean;
}

// Shared resources for preview generation
const loader = new GLTFLoader();
const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  preserveDrawingBuffer: true // Required for taking screenshots
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

export const ModelPreview: React.FC<ModelPreviewProps> = ({ 
  modelUrl, 
  previewUrl, 
  className,
  generatePreview = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);

  // If we have a preview URL and aren't generating a new preview, just show the image
  if (preview && !generatePreview) {
    return (
      <div 
        ref={containerRef}
        className={`${className} relative overflow-hidden`}
        style={{ minHeight: '200px' }}
      >
        <img 
          src={preview} 
          alt="Model preview"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Only set up 3D preview if we need to generate one
  useEffect(() => {
    if (!containerRef.current || !generatePreview) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#242429');

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2;
    controls.enableZoom = false;

    loader.load(modelUrl, (gltf) => {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      gltf.scene.scale.multiplyScalar(scale);
      gltf.scene.position.sub(center.multiplyScalar(scale));

      scene.add(gltf.scene);

      // Render a few frames to ensure model is properly positioned
      for (let i = 0; i < 5; i++) {
        controls.update();
        renderer.render(scene, camera);
      }

      // Capture the preview
      const dataUrl = renderer.domElement.toDataURL('image/png');
      setPreview(dataUrl);

      // Clean up 3D resources after capturing preview
      scene.clear();
      controls.dispose();
      renderer.domElement.remove();
    });

    return () => {
      scene.clear();
      controls?.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl, generatePreview]);

  // Show loading state while generating preview
  if (generatePreview && !preview) {
    return (
      <div 
        ref={containerRef}
        className={`${className} relative flex items-center justify-center`}
        style={{ minHeight: '200px' }}
      >
        <span className="text-sm text-gray-400">Generating preview...</span>
      </div>
    );
  }

  // Show generated preview
  return (
    <div 
      ref={containerRef}
      className={`${className} relative overflow-hidden`}
      style={{ minHeight: '200px' }}
    >
      {preview && (
        <img 
          src={preview} 
          alt="Model preview"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}; 