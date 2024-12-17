import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

interface ModelProps {
  url: string;
  displayMode: 'wireframe' | 'shaded';
}

export const ImageTo3DModel: React.FC<ModelProps> = ({ url, displayMode }) => {
  const model = useGLTF(url);

  return (
    <primitive 
      object={model.scene} 
      position={[0, 0, 0]}
      scale={1}
      onUpdate={(self: THREE.Object3D) => {
        // Center the model
        const box = new THREE.Box3().setFromObject(self);
        const center = box.getCenter(new THREE.Vector3());
        self.position.sub(center);
        
        // Apply material settings matching SceneBuilder
        self.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0xffffff,
              metalness: 0.2,
              roughness: 0.3,
              clearcoat: 0.5,
              clearcoatRoughness: 0.2,
              envMapIntensity: 1.0,
              wireframe: displayMode === 'wireframe',
              side: THREE.DoubleSide
            });
            
            // Enable shadows
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }}
    />
  );
}; 