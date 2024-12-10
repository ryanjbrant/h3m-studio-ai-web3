import { useEffect, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { fetchModelWithAuth } from '../../services/meshyApi';
import { suspend } from 'suspend-react';
import * as THREE from 'three';

interface LoadedModelProps {
  url: string;
}

export function LoadedModel({ url }: LoadedModelProps) {
  const modelRef = useRef<THREE.Group>();

  const gltf = suspend(async () => {
    try {
      const objectUrl = await fetchModelWithAuth(url);
      const loader = new GLTFLoader();
      const result = await new Promise((resolve, reject) => {
        loader.load(
          objectUrl,
          (gltf) => {
            URL.revokeObjectURL(objectUrl);
            resolve(gltf);
          },
          undefined,
          (error) => {
            URL.revokeObjectURL(objectUrl);
            reject(error);
          }
        );
      });
      return result;
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    }
  }, [url]);

  useEffect(() => {
    if (gltf?.scene) {
      // Center the model
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);

      // Scale the model to fit
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      gltf.scene.scale.multiplyScalar(scale);
    }
  }, [gltf]);

  useEffect(() => {
    return () => {
      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, []);

  return <primitive ref={modelRef} object={gltf.scene} />;
}