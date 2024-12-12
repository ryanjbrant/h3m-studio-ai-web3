/**
 * SceneObject Component
 * Renders and manages individual 3D models within the scene.
 * Handles model loading, material setup, and interaction events.
 */

import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneObjectData } from './SceneBuilder';

interface SceneObjectProps {
  object: SceneObjectData;      // Object data containing position, rotation, scale, and model URL
  isSelected: boolean;          // Whether this object is currently selected
  onClick: () => void;          // Handler for object selection
  onUpdate: (updates: Partial<SceneObjectData>) => void;  // Handler for object property updates
}

export function SceneObject({ object, isSelected, onClick, onUpdate }: SceneObjectProps) {
  console.log('SceneObject render:', { object, isSelected });
  
  // Load model through proxy to handle CORS and authentication
  const proxyUrl = `http://localhost:3001/api/model?url=${encodeURIComponent(object.modelUrl)}`;
  const { scene } = useGLTF(proxyUrl);
  const groupRef = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  // Setup model materials and shadows when scene is loaded
  useEffect(() => {
    if (!scene) {
      console.log('Scene not loaded yet for object:', object.id);
      return;
    }

    console.log('Processing scene for object:', object.id);
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enable shadows for all meshes
        child.castShadow = true;
        child.receiveShadow = true;

        // Configure materials for realistic rendering
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(material => {
            if (material instanceof THREE.Material) {
              material.roughness = 0.3;
              material.metalness = 0.7;
              material.envMapIntensity = 1;
              material.needsUpdate = true;
              material.side = THREE.DoubleSide;
            }
          });
        }
      }
    });

    // Cleanup function to clear loaded models from memory
    return () => {
      console.log('Cleaning up scene object:', object.id);
      useGLTF.clear(proxyUrl);
    };
  }, [scene, proxyUrl, object.id]);

  return (
    <group
      ref={groupRef}
      position={new THREE.Vector3(...object.position)}
      rotation={new THREE.Euler(...object.rotation)}
      scale={new THREE.Vector3(...object.scale)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <primitive object={scene} />
      {/* Show selection box around selected object */}
      {isSelected && (
        <boxHelper args={[scene, '#00ff00']} />
      )}
    </group>
  );
}