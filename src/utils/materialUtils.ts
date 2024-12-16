import * as THREE from 'three';
import { TextureMapUrls } from '../services/modelService';

export type DisplayMode = 'wireframe' | 'shaded' | 'albedo';
export type ModelType = 'text-to-3d' | 'image-to-3d' | 'other';

interface MaterialConfig {
  displayMode: DisplayMode;
  modelType: ModelType;
  textures?: TextureMapUrls;
}

export function createModelMaterial({ displayMode, modelType, textures }: MaterialConfig): THREE.Material {
  if (modelType === 'text-to-3d') {
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.4,
      roughness: 0.6,
      clearcoat: 0.4,
      clearcoatRoughness: 0.1,
      ior: 1.1,
      envMapIntensity: 0.9,
      side: THREE.DoubleSide,
    });

    // Apply display mode settings
    switch (displayMode) {
      case 'wireframe':
        material.wireframe = true;
        break;
      case 'shaded':
        material.wireframe = false;
        material.roughness = 0.8;
        material.metalness = 0.2;
        material.envMapIntensity = 0.9;
        break;
      case 'albedo':
        material.wireframe = false;
        material.roughness = 1;
        material.metalness = 0;
        material.envMapIntensity = 0;
        break;
    }

    return material;
  }

  // Default to MeshStandardMaterial for other types
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.5,
    roughness: 0.5,
  });
}

export function updateMaterialForDisplayMode(
  material: THREE.Material,
  displayMode: DisplayMode,
  modelType: ModelType
): void {
  if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
    material.wireframe = displayMode === 'wireframe';

    if (modelType === 'image-to-3d') {
      // Store original maps
      const originalMap = material.map;
      const originalNormalMap = material.normalMap;
      const originalDisplacementMap = material.displacementMap;
      const originalAoMap = material.aoMap;
      const originalRoughnessMap = material.roughnessMap;

      switch (displayMode) {
        case 'albedo':
          material.envMapIntensity = 0;
          material.normalScale?.set(0, 0);
          material.displacementScale = 0;
          material.aoMapIntensity = 0;
          material.roughness = 1;
          material.metalness = 0;
          // Keep only the diffuse/albedo map
          material.map = originalMap;
          material.normalMap = null;
          material.displacementMap = null;
          material.aoMap = null;
          material.roughnessMap = null;
          break;
        case 'shaded':
          material.envMapIntensity = 1.0;
          material.normalScale?.set(1, 1);
          material.displacementScale = 0.1;
          material.aoMapIntensity = 1;
          material.roughness = 0.5;
          material.metalness = 0.1;
          // Restore all original maps
          material.map = originalMap;
          material.normalMap = originalNormalMap;
          material.displacementMap = originalDisplacementMap;
          material.aoMap = originalAoMap;
          material.roughnessMap = originalRoughnessMap;
          break;
      }
    } else {
      switch (displayMode) {
        case 'shaded':
          material.roughness = 0.3;
          material.metalness = 0.7;
          material.envMapIntensity = 1.5;
          break;
        case 'albedo':
          material.roughness = 1;
          material.metalness = 0;
          material.envMapIntensity = 0;
          break;
      }
    }

    material.needsUpdate = true;
  }
}

export function applyTexturesToMaterial(
  material: THREE.Material,
  textures: TextureMapUrls
): void {
  if (material instanceof THREE.MeshStandardMaterial) {
    if (textures.albedo) material.map = new THREE.TextureLoader().load(textures.albedo);
    if (textures.normal) {
      material.normalMap = new THREE.TextureLoader().load(textures.normal);
      material.normalScale.set(1, 1);
    }
    if (textures.displacement) {
      material.displacementMap = new THREE.TextureLoader().load(textures.displacement);
      material.displacementScale = 0.1;
    }
    if (textures.ao) {
      material.aoMap = new THREE.TextureLoader().load(textures.ao);
      material.aoMapIntensity = 1;
    }
    if (textures.specular) {
      material.roughnessMap = new THREE.TextureLoader().load(textures.specular);
    }
    material.needsUpdate = true;
  }
}

export function disposeMaterial(material: THREE.Material | THREE.Material[]): void {
  const materials = Array.isArray(material) ? material : [material];
  
  materials.forEach(mat => {
    if (mat instanceof THREE.MeshStandardMaterial) {
      if (mat.map) mat.map.dispose();
      if (mat.normalMap) mat.normalMap.dispose();
      if (mat.displacementMap) mat.displacementMap.dispose();
      if (mat.aoMap) mat.aoMap.dispose();
      if (mat.roughnessMap) mat.roughnessMap.dispose();
    }
    mat.dispose();
  });
} 