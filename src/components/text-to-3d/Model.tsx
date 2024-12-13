import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { TextureMapUrls } from '../../services/modelService';

interface ModelProps {
  url: string;
  displayMode: 'wireframe' | 'shaded' | 'albedo';
  onTextureApplied?: (callback: (textureUrls: TextureMapUrls) => void) => void;
}

export function Model({ url, displayMode, onTextureApplied }: ModelProps) {
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

  // Apply textures when they're received
  useEffect(() => {
    if (onTextureApplied && modelRef.current) {
      onTextureApplied((textureUrls: TextureMapUrls) => {
        modelRef.current?.traverse((child) => {
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
      });
    }
  }, [onTextureApplied]);

  return <primitive ref={modelRef} object={gltf.scene} />;
}