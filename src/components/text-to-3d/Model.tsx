import { useEffect, useRef, useState, useCallback } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { TextureMapUrls } from '../../types/model';
import { createModelMaterial, updateMaterialForDisplayMode, applyTexturesToMaterial, disposeMaterial } from '../../utils/materialUtils';
import { Html } from '@react-three/drei';

interface ModelProps {
  url: string;
  displayMode: 'wireframe' | 'shaded' | 'albedo';
  onTextureApplied?: (callback: (textureUrls: TextureMapUrls) => void) => void;
  modelType?: 'text-to-3d' | 'image-to-3d' | 'other';
}

export function Model({ url, displayMode, onTextureApplied, modelType = 'text-to-3d' }: ModelProps) {
  const modelRef = useRef<THREE.Group>();
  const [isApplyingTextures, setIsApplyingTextures] = useState(false);

  // Use the proxied URL for loading
  const gltf = useGLTF(url);

  const applyMaterial = useCallback((child: THREE.Mesh) => {
    if (modelType === 'image-to-3d') {
      // For image-to-3D models, update the existing material
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(material => {
          updateMaterialForDisplayMode(material, displayMode, modelType);
        });
      }
      return;
    }

    // For text-to-3d models, create new material
    const oldMaterial = child.material;
    const material = createModelMaterial({ displayMode, modelType });
    
    // Apply new material
    child.material = material;

    // Dispose of old material
    if (oldMaterial) {
      disposeMaterial(oldMaterial);
    }
  }, [displayMode, modelType]);

  // Apply materials when model loads
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          applyMaterial(child);
        }
      });
    }
  }, [applyMaterial]);

  const applyTextures = useCallback(async (textureUrls: TextureMapUrls) => {
    if (!modelRef.current) return;
    setIsApplyingTextures(true);
    
    try {
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (modelType === 'image-to-3d') {
            // For image-to-3D, modify the existing material
            applyTexturesToMaterial(child.material, textureUrls);
            updateMaterialForDisplayMode(child.material, displayMode, modelType);
          } else {
            // For text-to-3D, create new material with textures
            const oldMaterial = child.material;
            const material = createModelMaterial({ displayMode, modelType, textures: textureUrls });
            child.material = material;
            disposeMaterial(oldMaterial);
          }
        }
      });
    } catch (error) {
      console.error('Error applying textures:', error);
    } finally {
      setIsApplyingTextures(false);
    }
  }, [displayMode, modelType]);

  // Register texture handler
  useEffect(() => {
    if (onTextureApplied) {
      onTextureApplied(applyTextures);
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