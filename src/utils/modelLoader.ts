import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';

const loadingManager = new THREE.LoadingManager();
const loaders = {
  glb: new GLTFLoader(loadingManager),
  gltf: new GLTFLoader(loadingManager),
  obj: new OBJLoader(loadingManager),
  fbx: new FBXLoader(loadingManager),
};

export async function loadModel(url: string) {
  try {
    const extension = url.split('.').pop()?.toLowerCase();
    const loader = loaders[extension as keyof typeof loaders];
    
    if (!loader) {
      throw new Error(`Unsupported file format: ${extension}`);
    }

    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (result) => {
          // Handle both GLTF and other formats
          const model = 'scene' in result ? result.scene : result;
          
          // Center and scale the model
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2 / maxDim;
          
          model.position.sub(center);
          model.scale.multiplyScalar(scale);
          
          // Ensure proper material handling
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Ensure materials are properly configured
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                    mat.needsUpdate = true;
                    mat.side = THREE.DoubleSide;
                  });
                } else {
                  child.material.needsUpdate = true;
                  child.material.side = THREE.DoubleSide;
                }
              }
            }
          });
          
          resolve(model);
        },
        (progress) => {
          const percent = (progress.loaded / progress.total * 100).toFixed(2);
          console.log(`Loading progress: ${percent}%`);
        },
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('Error in loadModel:', error);
    throw error;
  }
}